import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  Button,
  List,
  ListItem,
  ListSubheader,
  styled,
  Tooltip
} from '@mui/material';
import { useThrottle } from '@uidotdev/usehooks';
import { HslValues } from '@/utils/textures';
import {
  adjustTextureHsl,
  selectEditedTextures,
  selectTextureDefs,
  useAppDispatch,
  useAppSelector
} from '@/store';
import NumericSliderInput from './NumericSliderInput';

const StyledList = styled(List)(
  ({ theme }) =>
    `
    &.texture-view {
      display: flex;
      padding: 0;
    }

    ${theme.breakpoints.down('md')} {
      &.texture-view {
        flex-direction: column;
      }
    }

    &.texture-view .MuiListItem-root {
      padding-left: ${theme.spacing(0)};
      padding-right: ${theme.spacing(0)};
    }

    & .MuiButton svg {
      margin-right: ${theme.spacing(1)};
    }
    
    & .slider p {
      display: flex;
      align-items: center;
    }`
);

const DEFAULT_HSL = {
  h: 0,
  s: 0,
  l: 0
};

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
  const [hsl, setHsl] = useState<HslValues>(() => {
    if (!editedTextures?.[textureIndex]?.hsl) {
      return DEFAULT_HSL;
    }

    const { h, s, l } = editedTextures[textureIndex].hsl;
    return h || s || l ? editedTextures[textureIndex].hsl : DEFAULT_HSL;
  });

  useEffect(() => {
    if (!editedTextures?.[textureIndex]?.hsl) {
      setHsl(DEFAULT_HSL);
      return;
    }

    const { h, s, l } = editedTextures[textureIndex].hsl;
    setHsl(h || s || l ? editedTextures[textureIndex].hsl : DEFAULT_HSL);
  }, [textureIndex]);

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
  }, [hsl, textureIndex]);

  const ButtonOption = useCallback(
    ({
      tooltip,
      onClick,
      label,
      disabled
    }: {
      tooltip: string;
      onClick: () => void;
      label: JSX.Element | string;
      disabled?: boolean;
    }) => {
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
    },
    []
  );

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
    <ButtonOption
      tooltip='Apply color changes to all loaded textures'
      onClick={onApplyToAll}
      label={<>Apply to All</>}
    />
  );

  if (variant === 'texture-view') {
    return (
      <StyledList className={variant}>
        {hslSliders}
        {buttons}
      </StyledList>
    );
  }

  return (
    <StyledList
      dense
      className={clsx('hsv-sliders', variant)}
      subheader={
        <ListSubheader component='div'>Color Adjustment</ListSubheader>
      }
    >
      {hslSliders}
      {buttons}
    </StyledList>
  );
}
