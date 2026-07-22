import {
  ChangeEvent,
  JSX,
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  UvClipPath
} from '@/utils/textures';
import { adjustTextureHsl, getTextureHslScopeKey } from '../modelDataThunks';
import { selectUpdatedTextureDefs } from '@/selectors';
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
  const textureDefs = useAppSelector(selectUpdatedTextureDefs);
  const textureDef = textureDefs[textureIndex];
  const textureHslSession = useAppSelector(
    (state) => state.modelData.textureHslSessions[textureIndex]
  );

  const hasTouchedHslInputRef = useRef(false);
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
  const activeHslScopeKey = useMemo(
    () => getTextureHslScopeKey(textureIndex, activeUvPixelByteIndexes),
    [activeUvPixelByteIndexes, textureIndex]
  );
  const [hslState, setHslState] = useState(() => ({
    scopeKey: activeHslScopeKey,
    value:
      textureHslSession?.scopeKey === activeHslScopeKey
        ? textureHslSession.hsl
        : DEFAULT_HSL
  }));
  const hsl =
    hslState.scopeKey === activeHslScopeKey ? hslState.value : DEFAULT_HSL;

  useDebouncedEffect(
    () => {
      if (textureHslSession?.scopeKey === activeHslScopeKey) {
        const { h, s, l } = textureHslSession.hsl;
        if (h !== hsl.h || s !== hsl.s || l !== hsl.l) {
          setHslState({
            scopeKey: activeHslScopeKey,
            value: textureHslSession.hsl
          });
        }
      }
    },
    [activeHslScopeKey, textureHslSession],
    150
  );

  const onSetH = useCallback(
    (h: number) => {
      hasTouchedHslInputRef.current = true;
      setHslState((previous) => ({
        scopeKey: activeHslScopeKey,
        value: {
          ...(previous.scopeKey === activeHslScopeKey
            ? previous.value
            : DEFAULT_HSL),
          h
        }
      }));
    },
    [activeHslScopeKey]
  );

  const onSetS = useCallback(
    (s: number) => {
      hasTouchedHslInputRef.current = true;
      setHslState((previous) => ({
        scopeKey: activeHslScopeKey,
        value: {
          ...(previous.scopeKey === activeHslScopeKey
            ? previous.value
            : DEFAULT_HSL),
          s
        }
      }));
    },
    [activeHslScopeKey]
  );

  const onSetL = useCallback(
    (l: number) => {
      hasTouchedHslInputRef.current = true;
      setHslState((previous) => ({
        scopeKey: activeHslScopeKey,
        value: {
          ...(previous.scopeKey === activeHslScopeKey
            ? previous.value
            : DEFAULT_HSL),
          l
        }
      }));
    },
    [activeHslScopeKey]
  );

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
    hasTouchedHslInputRef.current = false;
  }, [activeHslScopeKey, textureIndex]);

  useEffect(() => {
    if (!hasTouchedHslInputRef.current) {
      return;
    }

    dispatch(
      adjustTextureHsl({
        hsl: processedHsl,
        sourceBufferKeys: textureDef?.bufferKeys,
        textureIndex,
        uvPixelByteIndexes: activeUvPixelByteIndexes
      })
    );
  }, [
    activeUvPixelByteIndexes,
    dispatch,
    processedHsl,
    textureDef?.bufferKeys,
    textureIndex
  ]);

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
