import type { PointerEvent as ReactPointerEvent } from 'react';
import { useCallback, useRef, useState } from 'react';
import {
  useComputed,
  useSignal,
  useSignalEffect
} from '@preact-signals/safe-react';
import type { ColorResult } from 'react-color';
import { SketchPicker } from 'react-color';
import { Box, Popover } from '@mui/material';
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

interface GradientVertexColorControlsProps {
  popoverAnchorEl: HTMLDivElement | null;
  onApplyGradient: (payload: ApplySelectedVertexGradientPayload) => void;
}

export default function GradientVertexColorControls({
  popoverAnchorEl,
  onApplyGradient
}: GradientVertexColorControlsProps) {
  const $gradientTransform = useSignal<GradientTransform>({
    angle: DEFAULT_GRADIENT_ANGLE,
    tilt: DEFAULT_GRADIENT_TILT,
    pivotPoint: DEFAULT_GRADIENT_PIVOT_POINT
  });

  const $gradientStartColor = useSignal(DEFAULT_GRADIENT_START_COLOR);
  const $gradientEndColor = useSignal(DEFAULT_GRADIENT_END_COLOR);
  const [activeGradientColorHandle, setActiveGradientColorHandle] =
    useState<GradientColorHandle | null>(null);
  const hasAppliedGradientRef = useRef(false);
  const $gradientPayload = useComputed<ApplySelectedVertexGradientPayload>(
    () => {
      const startColor = $gradientStartColor.value;
      const endColor = $gradientEndColor.value;
      const { angle, tilt, pivotPoint } = $gradientTransform.value;

      return {
        startColor: [
          startColor.r / 0xff,
          startColor.g / 0xff,
          startColor.b / 0xff
        ],
        endColor: [endColor.r / 0xff, endColor.g / 0xff, endColor.b / 0xff],
        angle,
        tilt,
        pivotPoint
      };
    }
  );

  useSignalEffect(() => {
    const gradientPayload = $gradientPayload.value;

    if (!hasAppliedGradientRef.current) {
      hasAppliedGradientRef.current = true;

      return;
    }

    onApplyGradient(gradientPayload);
  });

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

  const gradientStartColor = $gradientStartColor.value;
  const gradientEndColor = $gradientEndColor.value;
  const { pivotPoint } = $gradientTransform.value;
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
