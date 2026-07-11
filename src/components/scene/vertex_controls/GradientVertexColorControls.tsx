import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import { useCallback, useRef } from 'react';
import { batch, useSignal, useSignalEffect } from '@preact-signals/safe-react';
import { Box, IconButton, Tooltip } from '@mui/material';
import NumericSliderInput from '@/components/NumericSliderInput';
import type { ApplySelectedVertexGradientPayload } from '@/modules/model-data';
import GradientSelectionPreview, {
  clamp,
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_END_COLOR,
  DEFAULT_GRADIENT_PIVOT_POINT,
  DEFAULT_GRADIENT_START_COLOR,
  DEFAULT_GRADIENT_TILT,
  GRADIENT_MAX_ANGLE
} from './GradientSelectionPreview';

interface GradientVertexColorControlsProps {
  popoverAnchorEl: HTMLDivElement | null;
  onApplyGradient: (payload: ApplySelectedVertexGradientPayload) => void;
}

export default function GradientVertexColorControls({
  popoverAnchorEl,
  onApplyGradient
}: GradientVertexColorControlsProps) {
  const $gradientAngle = useSignal(DEFAULT_GRADIENT_ANGLE);
  const $gradientTilt = useSignal(DEFAULT_GRADIENT_TILT);
  const $gradientPivotPoint = useSignal(DEFAULT_GRADIENT_PIVOT_POINT);

  const $gradientStartColor = useSignal(DEFAULT_GRADIENT_START_COLOR);
  const $gradientEndColor = useSignal(DEFAULT_GRADIENT_END_COLOR);
  const hasAppliedGradientRef = useRef(false);

  useSignalEffect(() => {
    const gradientPayload = {
      startHexColor: $gradientStartColor.value,
      endHexColor: $gradientEndColor.value,
      angle: $gradientAngle.value,
      tilt: $gradientTilt.value,
      pivotPoint: $gradientPivotPoint.value
    };

    if (!hasAppliedGradientRef.current) {
      hasAppliedGradientRef.current = true;

      return;
    }

    onApplyGradient(gradientPayload);
  });

  const onSetGradientAngles = useCallback(
    (nextAngle: number, nextTilt: number) => {
      const clampedAngle = clamp(nextAngle, 0, GRADIENT_MAX_ANGLE);
      const clampedTilt = clamp(nextTilt, -90, 90);

      batch(() => {
        $gradientAngle.value = clampedAngle;
        $gradientTilt.value = clampedTilt;
      });
    },
    [$gradientAngle, $gradientTilt]
  );

  const onSetGradientAngle = useCallback(
    (nextAngle: number) => {
      onSetGradientAngles(nextAngle, $gradientTilt.value);
    },
    [$gradientTilt, onSetGradientAngles]
  );

  const onSetGradientTilt = useCallback(
    (nextTilt: number) => {
      onSetGradientAngles($gradientAngle.value, nextTilt);
    },
    [$gradientAngle, onSetGradientAngles]
  );

  const onRotateGradientAngleLeft = useCallback(() => {
    onSetGradientAngle($gradientAngle.value - 45);
  }, [$gradientAngle, onSetGradientAngle]);

  const onRotateGradientAngleRight = useCallback(() => {
    onSetGradientAngle($gradientAngle.value + 45);
  }, [$gradientAngle, onSetGradientAngle]);

  const onRotateGradientTiltLeft = useCallback(() => {
    onSetGradientTilt($gradientTilt.value - 45);
  }, [$gradientTilt, onSetGradientTilt]);

  const onRotateGradientTiltRight = useCallback(() => {
    onSetGradientTilt($gradientTilt.value + 45);
  }, [$gradientTilt, onSetGradientTilt]);

  const onSetGradientPivotPoint = useCallback(
    (nextPivotPoint: number) => {
      const clampedPivotPoint = clamp(nextPivotPoint, 0, 1);

      batch(() => {
        $gradientPivotPoint.value = clampedPivotPoint;
      });
    },
    [$gradientPivotPoint]
  );

  return (
    <Box sx={{ display: 'grid', gap: 1.25, mt: 1 }}>
      <GradientSelectionPreview
        $gradientAngle={$gradientAngle}
        $gradientTilt={$gradientTilt}
        $gradientPivotPoint={$gradientPivotPoint}
        $gradientStartColor={$gradientStartColor}
        $gradientEndColor={$gradientEndColor}
        popoverAnchorEl={popoverAnchorEl}
        onChangeAngles={onSetGradientAngles}
      />
      <Box sx={{ display: 'flex', flexDirection: 'column', p: 0 }}>
        <NumericSliderInput
          labelTooltip='Gradient angle'
          label='Angle'
          labelSx={{ width: 32 }}
          defaultValue={DEFAULT_GRADIENT_ANGLE}
          min={0}
          max={GRADIENT_MAX_ANGLE}
          value={$gradientAngle.value}
          onChange={onSetGradientAngle}
          inputSx={{ width: 60 }}
          additionalControls={
            <>
              <Tooltip title='Rotate angle left'>
                <IconButton
                  size='small'
                  color='secondary'
                  onClick={onRotateGradientAngleLeft}
                  aria-label='Rotate angle left'
                >
                  <RotateLeftIcon fontSize='small' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Rotate angle right'>
                <IconButton
                  size='small'
                  color='secondary'
                  onClick={onRotateGradientAngleRight}
                  aria-label='Rotate angle right'
                >
                  <RotateRightIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </>
          }
        />
        <NumericSliderInput
          labelTooltip='Gradient tilt'
          label='Tilt'
          labelSx={{ width: 32 }}
          defaultValue={DEFAULT_GRADIENT_TILT}
          min={-90}
          max={90}
          value={$gradientTilt.value}
          onChange={onSetGradientTilt}
          inputSx={{ width: 60 }}
          sx={{ mt: -1 }}
          additionalControls={
            <>
              <Tooltip title='Rotate tilt left'>
                <IconButton
                  size='small'
                  color='secondary'
                  onClick={onRotateGradientTiltLeft}
                  aria-label='Rotate tilt left'
                >
                  <RotateLeftIcon fontSize='small' />
                </IconButton>
              </Tooltip>
              <Tooltip title='Rotate tilt right'>
                <IconButton
                  size='small'
                  color='secondary'
                  onClick={onRotateGradientTiltRight}
                  aria-label='Rotate tilt right'
                >
                  <RotateRightIcon fontSize='small' />
                </IconButton>
              </Tooltip>
            </>
          }
        />
        <NumericSliderInput
          labelTooltip='Moves the point the gradient bends around'
          label='Pivot'
          labelSx={{ width: 32 }}
          defaultValue={DEFAULT_GRADIENT_PIVOT_POINT}
          min={0}
          max={1}
          step={0.01}
          value={$gradientPivotPoint.value}
          onChange={onSetGradientPivotPoint}
          inputSx={{ width: 60 }}
          sx={{ mt: -1 }}
        />
      </Box>
    </Box>
  );
}
