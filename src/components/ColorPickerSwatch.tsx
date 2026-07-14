import type { MouseEvent } from 'react';
import { useCallback, useState } from 'react';
import type { PopoverProps, SxProps, Theme } from '@mui/material';
import { ButtonBase, Popover, Tooltip } from '@mui/material';
import { type Color, type ColorChangeHandler, SketchPicker } from 'react-color';

const DEFAULT_POPOVER_ANCHOR_ORIGIN = {
  vertical: 'top',
  horizontal: 'left'
} as const;

const DEFAULT_POPOVER_TRANSFORM_ORIGIN = {
  vertical: 'bottom',
  horizontal: 'left'
} as const;

interface ColorPickerSwatchProps {
  ariaLabel: string;
  color: Color;
  onChange: ColorChangeHandler;
  tooltip?: string;
  swatchColor?: string;
  swatchSx?: SxProps<Theme>;
  anchorOrigin?: PopoverProps['anchorOrigin'];
  transformOrigin?: PopoverProps['transformOrigin'];
  popoverSlotProps?: PopoverProps['slotProps'];
}

export default function ColorPickerSwatch({
  ariaLabel,
  color,
  onChange,
  tooltip,
  swatchColor,
  swatchSx,
  anchorOrigin = DEFAULT_POPOVER_ANCHOR_ORIGIN,
  transformOrigin = DEFAULT_POPOVER_TRANSFORM_ORIGIN,
  popoverSlotProps
}: ColorPickerSwatchProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const isOpen = Boolean(anchorEl);
  const resolvedSwatchColor =
    swatchColor ?? (typeof color === 'string' ? color : undefined);

  const onOpenColorPicker = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    },
    []
  );

  const onCloseColorPicker = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const swatchBaseSx: SxProps<Theme> = {
    width: 20,
    height: 20,
    p: 0,
    flexShrink: 0,
    borderRadius: 0.5,
    overflow: 'hidden',
    backgroundColor: resolvedSwatchColor,
    border: '1px solid',
    borderColor: isOpen
      ? 'var(--mui-palette-primary-main)'
      : 'var(--mui-palette-divider)'
  };
  const swatchResolvedSx: SxProps<Theme> = !swatchSx
    ? swatchBaseSx
    : [swatchBaseSx, ...(Array.isArray(swatchSx) ? swatchSx : [swatchSx])];

  const swatch = (
    <ButtonBase
      aria-label={ariaLabel}
      onClick={onOpenColorPicker}
      sx={swatchResolvedSx}
    />
  );

  return (
    <>
      {!tooltip ? swatch : <Tooltip title={tooltip}>{swatch}</Tooltip>}
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={onCloseColorPicker}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        slotProps={popoverSlotProps}
      >
        <SketchPicker color={color} onChange={onChange} />
      </Popover>
    </>
  );
}
