import { JSX, useCallback, useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Button, List, ListItem, ListSubheader, Tooltip } from '@mui/material';
import type { Theme } from '@mui/material/styles';
import { useThrottle } from '@uidotdev/usehooks';
import { HslValues } from '@/utils/textures';
import { adjustTextureHsl } from '../modelDataThunks';
import { selectEditedTextures, selectTextureDefs } from '@/selectors';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import NumericSliderInput from '@/components/NumericSliderInput';
import { useDebouncedEffect } from '@/hooks';

const textureColorOptionsListSx = (theme: Theme) => ({
  '&.texture-view': {
    display: 'flex',
    p: 0
  },
  [theme.breakpoints.down('md')]: {
    '&.texture-view': {
      flexDirection: 'column'
    }
  },
  '&.texture-view .MuiListItem-root': {
    px: 0
  },
  '& .MuiButton svg': {
    mr: 1
  },
  '& .slider p': {
    display: 'flex',
    alignItems: 'center'
  }
});

const DEFAULT_HSL = {
  h: 0,
  s: 0,
  l: 0
};

function TextureColorButtonOption({
  tooltip,
  onClick,
  label,
  disabled
}: {
  tooltip: string;
  onClick: () => void;
  label: JSX.Element | string;
  disabled?: boolean;
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
    <ListItem>
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
  variant = 'menu'
}: {
  textureIndex: number;
  variant: 'menu' | 'texture-view';
}) {
  const dispatch = useAppDispatch();
  const textureDefs = useAppSelector(selectTextureDefs);
  const editedTextures = useAppSelector(selectEditedTextures);
  const editedTexture = editedTextures?.[textureIndex];
  const baseHsl = useMemo(() => {
    if (!editedTexture?.hsl) {
      return DEFAULT_HSL;
    }

    const { h, s, l } = editedTexture.hsl;
    return h || s || l ? editedTexture.hsl : DEFAULT_HSL;
  }, [editedTexture]);

  const [hsl, setHsl] = useState<HslValues>(() => baseHsl);

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

  const processedHsl = useThrottle(hsl, 75);

  useEffect(() => {
    dispatch(adjustTextureHsl({ hsl: processedHsl, textureIndex }));
  }, [processedHsl]);

  const onApplyToAll = useCallback(() => {
    for (
      let textureIndex = 0;
      textureIndex < textureDefs.length;
      textureIndex++
    ) {
      dispatch(adjustTextureHsl({ hsl, textureIndex }));
    }
  }, [hsl, textureDefs]);

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
    <TextureColorButtonOption
      tooltip='Apply color changes to all loaded textures'
      onClick={onApplyToAll}
      label={<>Apply to All</>}
    />
  );

  if (variant === 'texture-view') {
    return (
      <List className={variant} sx={textureColorOptionsListSx}>
        {hslSliders}
        {buttons}
      </List>
    );
  }

  return (
    <List
      dense
      className={clsx('hsv-sliders', variant)}
      subheader={
        <ListSubheader component='div'>Color Adjustment</ListSubheader>
      }
      sx={textureColorOptionsListSx}
    >
      {hslSliders}
      {buttons}
    </List>
  );
}
