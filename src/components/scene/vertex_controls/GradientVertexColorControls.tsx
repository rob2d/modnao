import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useSignal } from '@preact-signals/safe-react';
import { useThrottle } from '@uidotdev/usehooks';
import type { ColorResult, RGBColor } from 'react-color';
import { SketchPicker } from 'react-color';
import { Box, IconButton, Popover, Tooltip } from '@mui/material';
import ColorPickerSwatch from '@/components/ColorPickerSwatch';
import type { ApplySelectedVertexGradientPayload } from '@/modules/model-data';
import GradientSelectionPreview, {
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_END_COLOR,
  DEFAULT_GRADIENT_PIVOT_POINT,
  DEFAULT_GRADIENT_START_COLOR,
  DEFAULT_GRADIENT_TILT,
  type GradientColorHandle,
  type GradientTransform
} from './GradientSelectionPreview';
import VertexGradientTransformControls from './VertexGradientTransformControls';

const GRADIENT_COLOR_POPOVER_ANCHOR_ORIGIN = {
  vertical: 'center',
  horizontal: 'left'
} as const;

const GRADIENT_COLOR_POPOVER_TRANSFORM_ORIGIN = {
  vertical: 'center',
  horizontal: 'right'
} as const;

const GRADIENT_TRANSFORM_THROTTLE_MS = 125;

interface GradientVertexColors {
  startColor: RGBColor;
  endColor: RGBColor;
}

interface GradientVertexColorControlsProps {
  popoverAnchorEl: HTMLDivElement | null;
  defaultGradientVertexColors: GradientVertexColors | undefined;
  onApplyGradient: (payload: ApplySelectedVertexGradientPayload) => void;
}

export default function GradientVertexColorControls({
  popoverAnchorEl,
  defaultGradientVertexColors,
  onApplyGradient
}: GradientVertexColorControlsProps) {
  const $gradientTransform = useSignal<GradientTransform>({
    angle: DEFAULT_GRADIENT_ANGLE,
    tilt: DEFAULT_GRADIENT_TILT,
    pivotPoint: DEFAULT_GRADIENT_PIVOT_POINT
  });

  const $gradientStartColor = useSignal(
    defaultGradientVertexColors?.startColor ?? DEFAULT_GRADIENT_START_COLOR
  );
  const $gradientEndColor = useSignal(
    defaultGradientVertexColors?.endColor ?? DEFAULT_GRADIENT_END_COLOR
  );
  const [activeGradientColorHandle, setActiveGradientColorHandle] =
    useState<GradientColorHandle | null>(null);
  const hasAppliedGradientRef = useRef(false);
  const gradientStartColor = $gradientStartColor.value;
  const gradientEndColor = $gradientEndColor.value;
  const { angle, tilt, pivotPoint } = $gradientTransform.value;
  const gradientAngleTilt = useMemo(() => ({ angle, tilt }), [angle, tilt]);
  const throttledGradientAngleTilt = useThrottle(
    gradientAngleTilt,
    GRADIENT_TRANSFORM_THROTTLE_MS
  );
  const gradientPayload = useMemo<ApplySelectedVertexGradientPayload>(
    () => ({
      startColor: [
        gradientStartColor.r / 0xff,
        gradientStartColor.g / 0xff,
        gradientStartColor.b / 0xff
      ],
      endColor: [
        gradientEndColor.r / 0xff,
        gradientEndColor.g / 0xff,
        gradientEndColor.b / 0xff
      ],
      angle: throttledGradientAngleTilt.angle,
      tilt: throttledGradientAngleTilt.tilt,
      pivotPoint
    }),
    [
      gradientEndColor,
      gradientStartColor,
      pivotPoint,
      throttledGradientAngleTilt.angle,
      throttledGradientAngleTilt.tilt
    ]
  );

  useEffect(() => {
    if (!hasAppliedGradientRef.current) {
      hasAppliedGradientRef.current = true;

      return;
    }

    onApplyGradient(gradientPayload);
  }, [gradientPayload, onApplyGradient]);

  const onOpenGradientColorPicker = useCallback(
    (handle: GradientColorHandle) => {
      setActiveGradientColorHandle(handle);
    },
    []
  );

  const onCloseGradientColorPicker = useCallback(() => {
    setActiveGradientColorHandle(null);
  }, []);

  const onStopGradientColorPopoverPointer = useCallback(
    (event: ReactPointerEvent<Element>) => {
      event.stopPropagation();
    },
    []
  );

  const onChangeGradientColor = useCallback(
    ({ rgb }: ColorResult) => {
      if (activeGradientColorHandle === 'start') {
        $gradientStartColor.value = rgb;

        return;
      }

      if (activeGradientColorHandle === 'end') {
        $gradientEndColor.value = rgb;
      }
    },
    [$gradientEndColor, $gradientStartColor, activeGradientColorHandle]
  );

  const onChangeGradientStartColor = useCallback(
    ({ rgb }: ColorResult) => ($gradientStartColor.value = rgb),
    [$gradientStartColor]
  );

  const onChangeGradientEndColor = useCallback(
    ({ rgb }: ColorResult) => ($gradientEndColor.value = rgb),
    [$gradientEndColor]
  );

  const onSwapGradientColors = useCallback(() => {
    const nextStartColor = $gradientEndColor.value;

    $gradientEndColor.value = $gradientStartColor.value;
    $gradientStartColor.value = nextStartColor;
  }, [$gradientEndColor, $gradientStartColor]);

  const activeGradientColor =
    activeGradientColorHandle === 'start'
      ? gradientStartColor
      : gradientEndColor;
  const gradientStartCssColor = `rgb(${gradientStartColor.r} ${gradientStartColor.g} ${gradientStartColor.b})`;
  const gradientEndCssColor = `rgb(${gradientEndColor.r} ${gradientEndColor.g} ${gradientEndColor.b})`;
  const gradientPivotCssColor = `rgb(${Math.round((gradientStartColor.r + gradientEndColor.r) / 2)} ${Math.round((gradientStartColor.g + gradientEndColor.g) / 2)} ${Math.round((gradientStartColor.b + gradientEndColor.b) / 2)})`;
  const gradientPivotPercent = `${pivotPoint * 100}%`;

  return (
    <Box sx={{ display: 'grid', gap: 1.25, my: 1 }}>
      <GradientSelectionPreview
        $gradientTransform={$gradientTransform}
        $gradientStartColor={$gradientStartColor}
        $gradientEndColor={$gradientEndColor}
        onOpenGradientColorPicker={onOpenGradientColorPicker}
        onCloseGradientColorPicker={onCloseGradientColorPicker}
      />
      <VertexGradientTransformControls
        $gradientTransform={$gradientTransform}
      />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '20px minmax(0, 1fr) 20px',
          alignItems: 'center',
          gap: 1,
          px: 2
        }}
      >
        <ColorPickerSwatch
          ariaLabel='Select gradient start color'
          color={gradientStartColor}
          swatchColor={gradientStartCssColor}
          onChange={onChangeGradientStartColor}
          anchorOrigin={GRADIENT_COLOR_POPOVER_ANCHOR_ORIGIN}
          transformOrigin={GRADIENT_COLOR_POPOVER_TRANSFORM_ORIGIN}
          popoverSlotProps={{ paper: { sx: { ml: -1 } } }}
        />
        <Box
          sx={{
            position: 'relative',
            height: 24,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: 10,
              borderRadius: 0.5,
              background: `linear-gradient(90deg, ${gradientStartCssColor} 0%, ${gradientPivotCssColor} ${gradientPivotPercent}, ${gradientEndCssColor} 100%)`,
              border: '1px solid var(--mui-palette-divider)',
              '&::after': {
                content: '""',
                position: 'absolute',
                left: gradientPivotPercent,
                top: -3,
                width: 2,
                height: 14,
                backgroundColor: 'var(--mui-palette-common-white)',
                border: '1px solid var(--mui-palette-common-black)',
                transform: 'translateX(-50%)'
              }
            }}
          />
          <Tooltip title='Swap gradient start and end colors'>
            <IconButton
              size='small'
              onClick={onSwapGradientColors}
              aria-label='Swap gradient start and end colors'
              sx={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: 20,
                height: 20,
                transform: 'translate(-50%, -50%)',
                border: '1px solid var(--mui-palette-divider)',
                backgroundColor: 'var(--mui-palette-background-paper)',
                color: 'var(--mui-palette-text-secondary)',
                '&:hover': {
                  backgroundColor: 'var(--mui-palette-background-paper)',
                  borderColor: 'var(--mui-palette-secondary-main)',
                  color: 'var(--mui-palette-secondary-main)'
                }
              }}
            >
              <SwapHorizIcon fontSize='inherit' />
            </IconButton>
          </Tooltip>
        </Box>
        <ColorPickerSwatch
          ariaLabel='Select gradient end color'
          color={gradientEndColor}
          swatchColor={gradientEndCssColor}
          onChange={onChangeGradientEndColor}
          anchorOrigin={GRADIENT_COLOR_POPOVER_ANCHOR_ORIGIN}
          transformOrigin={GRADIENT_COLOR_POPOVER_TRANSFORM_ORIGIN}
          popoverSlotProps={{ paper: { sx: { ml: -1 } } }}
        />
      </Box>
      {!activeGradientColorHandle ? null : (
        <Popover
          open={Boolean(popoverAnchorEl)}
          anchorEl={popoverAnchorEl}
          onClose={onCloseGradientColorPicker}
          anchorOrigin={GRADIENT_COLOR_POPOVER_ANCHOR_ORIGIN}
          transformOrigin={GRADIENT_COLOR_POPOVER_TRANSFORM_ORIGIN}
          onPointerDown={onStopGradientColorPopoverPointer}
          onPointerMove={onStopGradientColorPopoverPointer}
          onPointerUp={onStopGradientColorPopoverPointer}
          onPointerCancel={onStopGradientColorPopoverPointer}
          slotProps={{ paper: { sx: { ml: -1 } } }}
        >
          <SketchPicker
            color={activeGradientColor}
            onChange={onChangeGradientColor}
          />
        </Popover>
      )}
    </Box>
  );
}
