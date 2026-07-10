import { useCallback, useState } from 'react';
import { batch, useSignal } from '@preact-signals/safe-react';
import { Box, List } from '@mui/material';
import NumericSliderInput from '@/components/NumericSliderInput';
import type { ApplySelectedVertexGradientPayload } from '@/modules/model-data';
import GradientSelectionPreview, {
  clamp,
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_END_COLOR,
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
  const [gradientStartColor, setGradientStartColor] = useState(
    DEFAULT_GRADIENT_START_COLOR
  );
  const [gradientEndColor, setGradientEndColor] = useState(
    DEFAULT_GRADIENT_END_COLOR
  );

  const applyGradient = useCallback(
    (
      startHexColor: string,
      endHexColor: string,
      angle: number,
      tilt: number
    ) => {
      onApplyGradient({
        startHexColor,
        endHexColor,
        angle,
        tilt
      });
    },
    [onApplyGradient]
  );

  const onSetGradientAngles = useCallback(
    (nextAngle: number, nextTilt: number) => {
      const clampedAngle = clamp(nextAngle, 0, GRADIENT_MAX_ANGLE);
      const clampedTilt = clamp(nextTilt, -90, 90);

      batch(() => {
        $gradientAngle.value = clampedAngle;
        $gradientTilt.value = clampedTilt;
      });

      applyGradient(
        gradientStartColor,
        gradientEndColor,
        clampedAngle,
        clampedTilt
      );
    },
    [
      $gradientAngle,
      $gradientTilt,
      applyGradient,
      gradientEndColor,
      gradientStartColor
    ]
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

  const onChangeGradientStartColor = useCallback(
    (nextColor: string) => {
      setGradientStartColor(nextColor);
      applyGradient(
        nextColor,
        gradientEndColor,
        $gradientAngle.value,
        $gradientTilt.value
      );
    },
    [$gradientAngle, $gradientTilt, applyGradient, gradientEndColor]
  );

  const onChangeGradientEndColor = useCallback(
    (nextColor: string) => {
      setGradientEndColor(nextColor);
      applyGradient(
        gradientStartColor,
        nextColor,
        $gradientAngle.value,
        $gradientTilt.value
      );
    },
    [$gradientAngle, $gradientTilt, applyGradient, gradientStartColor]
  );

  return (
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      <GradientSelectionPreview
        $gradientAngle={$gradientAngle}
        $gradientTilt={$gradientTilt}
        gradientStartColor={gradientStartColor}
        gradientEndColor={gradientEndColor}
        popoverAnchorEl={popoverAnchorEl}
        onChangeAngles={onSetGradientAngles}
        onChangeGradientStartColor={onChangeGradientStartColor}
        onChangeGradientEndColor={onChangeGradientEndColor}
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
