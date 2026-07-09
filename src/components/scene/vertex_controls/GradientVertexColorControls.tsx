import { useCallback } from 'react';
import { batch, useSignal } from '@preact-signals/safe-react';
import { Box, List } from '@mui/material';
import NumericSliderInput from '@/components/NumericSliderInput';
import GradientSelectionPreview, {
  clamp,
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_TILT,
  GRADIENT_MAX_ANGLE
} from './GradientSelectionPreview';

interface GradientVertexColorControlsProps {
  popoverAnchorEl: HTMLDivElement | null;
}

export default function GradientVertexColorControls({
  popoverAnchorEl
}: GradientVertexColorControlsProps) {
  const $gradientAngle = useSignal(DEFAULT_GRADIENT_ANGLE);
  const $gradientTilt = useSignal(DEFAULT_GRADIENT_TILT);

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

  return (
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      <GradientSelectionPreview
        $gradientAngle={$gradientAngle}
        $gradientTilt={$gradientTilt}
        popoverAnchorEl={popoverAnchorEl}
        onChangeAngles={onSetGradientAngles}
      />
      <List sx={{ p: 0 }}>
        <NumericSliderInput
          labelTooltip='Gradient angle'
          label='Angle'
          defaultValue={DEFAULT_GRADIENT_ANGLE}
          min={0}
          max={GRADIENT_MAX_ANGLE}
          value={$gradientAngle.value}
          onChange={onSetGradientAngle}
        />
        <NumericSliderInput
          labelTooltip='Gradient tilt'
          label='Tilt'
          defaultValue={DEFAULT_GRADIENT_TILT}
          min={-90}
          max={90}
          value={$gradientTilt.value}
          onChange={onSetGradientTilt}
        />
      </List>
    </Box>
  );
}
