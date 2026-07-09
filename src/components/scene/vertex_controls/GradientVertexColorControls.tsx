import { useCallback, useRef, useState } from 'react';
import { signal } from '@preact/signals-react';
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
  const [gradientAngle, setGradientAngle] = useState(DEFAULT_GRADIENT_ANGLE);
  const [gradientTilt, setGradientTilt] = useState(DEFAULT_GRADIENT_TILT);
  const gradientAngleSignalRef = useRef(signal(DEFAULT_GRADIENT_ANGLE));
  const gradientTiltSignalRef = useRef(signal(DEFAULT_GRADIENT_TILT));

  const onSetGradientAngles = useCallback(
    (nextAngle: number, nextTilt: number) => {
      const clampedAngle = clamp(nextAngle, 0, GRADIENT_MAX_ANGLE);
      const clampedTilt = clamp(nextTilt, -90, 90);

      gradientAngleSignalRef.current.value = clampedAngle;
      gradientTiltSignalRef.current.value = clampedTilt;
      setGradientAngle(clampedAngle);
      setGradientTilt(clampedTilt);
    },
    []
  );

  const onSetGradientAngle = useCallback(
    (nextAngle: number) => {
      onSetGradientAngles(nextAngle, gradientTiltSignalRef.current.value);
    },
    [onSetGradientAngles]
  );

  const onSetGradientTilt = useCallback(
    (nextTilt: number) => {
      onSetGradientAngles(gradientAngleSignalRef.current.value, nextTilt);
    },
    [onSetGradientAngles]
  );

  return (
    <Box sx={{ display: 'grid', gap: 1.25 }}>
      <GradientSelectionPreview
        angleSignalRef={gradientAngleSignalRef}
        tiltSignalRef={gradientTiltSignalRef}
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
          value={gradientAngle}
          onChange={onSetGradientAngle}
        />
        <NumericSliderInput
          labelTooltip='Gradient tilt'
          label='Tilt'
          defaultValue={DEFAULT_GRADIENT_TILT}
          min={-90}
          max={90}
          value={gradientTilt}
          onChange={onSetGradientTilt}
        />
      </List>
    </Box>
  );
}
