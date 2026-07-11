import {
  ChangeEvent,
  JSX,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  Box,
  Button,
  FormControlLabel,
  List,
  ListItem,
  ListSubheader,
  Switch,
  type SxProps,
  type Theme,
  Tooltip
} from '@mui/material';
import { useThrottle } from '@uidotdev/usehooks';
import {
  getUvClipPathBounds,
  getUvClipPathPixelByteIndexes,
  HslValues,
  UvClipPath
} from '@/utils/textures';
import { adjustTextureHsl } from '../modelDataThunks';
import { selectEditedTextures, selectTextureDefs } from '@/selectors';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import NumericSliderInput from '@/components/NumericSliderInput';
import { useDebouncedEffect } from '@/hooks';

const DEFAULT_HSL = {
  h: 0,
  s: 0,
  l: 0
};

function TextureColorButtonOption({
  tooltip,
  onClick,
  label,
  disabled,
  sx
}: {
  tooltip: string;
  onClick: () => void;
  label: JSX.Element | string;
  disabled?: boolean;
  sx?: SxProps<Theme>;
}) {
  const button = (
    <Button
      onClick={onClick}
      color='secondary'
      size='small'
      variant='outlined'
      fullWidth
      disabled={disabled}
    >
      {label}
    </Button>
  );
  return (
    <ListItem sx={sx} dense>
      {disabled ? (
        button
      ) : (
        <Tooltip title={tooltip} placement='left-start'>
          {button}
        </Tooltip>
      )}
    </ListItem>
  );
}

export default function TextureColorOptions({
  textureIndex,
  variant = 'menu',
  selectedUvClipPaths = []
}: {
  textureIndex: number;
  variant: 'menu' | 'texture-view';
  selectedUvClipPaths?: UvClipPath[];
}) {
  const dispatch = useAppDispatch();
  const textureDefs = useAppSelector(selectTextureDefs);
  const editedTextures = useAppSelector(selectEditedTextures);
  const textureDef = textureDefs[textureIndex];
  const editedTexture = editedTextures?.[textureIndex];
  const baseHsl = useMemo(() => {
    if (!editedTexture?.hsl) {
      return DEFAULT_HSL;
    }

    const { h, s, l } = editedTexture.hsl;
    return h || s || l ? editedTexture.hsl : DEFAULT_HSL;
  }, [editedTexture]);

  const [hsl, setHsl] = useState<HslValues>(() => baseHsl);
  const [applyToWholeTexture, setApplyToWholeTexture] = useState(false);
  const hasSelectedUvClipPaths = selectedUvClipPaths.length > 0;
  const selectedUvClipPathBounds = useMemo(
    () => selectedUvClipPaths.map(getUvClipPathBounds),
    [selectedUvClipPaths]
  );
  const selectedUvPixelByteIndexes = useMemo(() => {
    if (
      applyToWholeTexture ||
      !textureDef ||
      !selectedUvClipPathBounds.length
    ) {
      return [];
    }

    // UV clip paths are texture pixel coordinates; testing pixel centers here
    // makes HSL slider updates reuse the same selected pixel list.
    return getUvClipPathPixelByteIndexes(
      selectedUvClipPathBounds,
      textureDef.width,
      textureDef.height
    );
  }, [applyToWholeTexture, selectedUvClipPathBounds, textureDef]);
  const activeUvPixelByteIndexes =
    hasSelectedUvClipPaths && !applyToWholeTexture
      ? selectedUvPixelByteIndexes
      : undefined;

  // keep hsl in sync in case we're in TextureView
  useDebouncedEffect(
    () => {
      const stateHsl = editedTextures?.[textureIndex]?.hsl;
      if (stateHsl) {
        const { h, s, l } = stateHsl;
        if (h !== hsl.h || s !== hsl.s || l !== hsl.l) {
          setHsl(stateHsl);
        }
      }
    },
    [editedTexture],
    150
  );

  const onSetH = useCallback((h: number) => {
    setHsl((prev) => ({ ...prev, h }));
  }, []);

  const onSetS = useCallback((s: number) => {
    setHsl((prev) => ({ ...prev, s }));
  }, []);

  const onSetL = useCallback((l: number) => {
    setHsl((prev) => ({ ...prev, l }));
  }, []);

  const onSetApplyToWholeTexture = useCallback(
    (_: ChangeEvent<HTMLInputElement>, checked: boolean) => {
      setApplyToWholeTexture(checked);
    },
    []
  );

  const onInputKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Tab') {
      event.stopPropagation();
    }
  }, []);

  const processedHsl = useThrottle(hsl, 200);

  useEffect(() => {
    dispatch(
      adjustTextureHsl({
        hsl: processedHsl,
        textureIndex,
        uvPixelByteIndexes: activeUvPixelByteIndexes
      })
    );
  }, [activeUvPixelByteIndexes, dispatch, processedHsl, textureIndex]);

  const onApplyToAll = useCallback(() => {
    for (
      let textureIndex = 0;
      textureIndex < textureDefs.length;
      textureIndex++
    ) {
      dispatch(adjustTextureHsl({ hsl, textureIndex }));
    }
  }, [dispatch, hsl, textureDefs]);

  const hslSliders = (
    <>
      <NumericSliderInput
        labelTooltip={`Hue`}
        label={'H'}
        defaultValue={0}
        min={-180}
        max={180}
        value={hsl.h}
        onChange={onSetH}
      />
      <NumericSliderInput
        labelTooltip={`Saturation`}
        label={'S'}
        defaultValue={0}
        min={-100}
        max={100}
        value={hsl.s}
        onChange={onSetS}
      />
      <NumericSliderInput
        labelTooltip={`Lightness`}
        label={'L'}
        defaultValue={0}
        min={-100}
        max={100}
        value={hsl.l}
        onChange={onSetL}
      />
    </>
  );

  const buttons = (
    <>
      {!hasSelectedUvClipPaths ? null : (
        <ListItem dense>
          <Tooltip
            title='Ignore the selected UV region and edit every pixel'
            placement='left-start'
          >
            <FormControlLabel
              control={
                <Switch
                  checked={applyToWholeTexture}
                  onChange={onSetApplyToWholeTexture}
                  size='small'
                />
              }
              label='Edit full texture'
            />
          </Tooltip>
        </ListItem>
      )}
      <TextureColorButtonOption
        tooltip='Apply color changes to all loaded textures'
        onClick={onApplyToAll}
        label={<>Apply to All</>}
        sx={{ mt: 1 }}
      />
    </>
  );

  if (variant === 'texture-view') {
    return (
      <Box
        sx={{
          display: 'flex',
          p: 0,
          flexDirection: { xs: 'column', md: 'row' },
          '& .MuiListItem-root': {
            px: 0
          },
          '& .MuiButton svg': {
            mr: 1
          },
          '& .slider p': {
            display: 'flex',
            alignItems: 'center'
          }
        }}
      >
        {hslSliders}
        {buttons}
      </Box>
    );
  }

  return (
    <List
      dense
      subheader={
        <ListSubheader component='div'>Color Adjustment</ListSubheader>
      }
      sx={{
        '& .MuiButton svg': {
          mr: 1
        },
        '& .slider p': {
          display: 'flex',
          alignItems: 'center'
        }
      }}
      onKeyDown={onInputKeyDown}
    >
      {hslSliders}
      {buttons}
    </List>
  );
}
