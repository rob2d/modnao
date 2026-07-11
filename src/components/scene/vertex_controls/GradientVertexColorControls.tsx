import { useRef } from 'react';
import {
  useComputed,
  useSignal,
  useSignalEffect
} from '@preact-signals/safe-react';
import { Box } from '@mui/material';
import type { ApplySelectedVertexGradientPayload } from '@/modules/model-data';
import GradientSelectionPreview, {
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_END_COLOR,
  DEFAULT_GRADIENT_PIVOT_POINT,
  DEFAULT_GRADIENT_START_COLOR,
  DEFAULT_GRADIENT_TILT,
  type GradientTransform
} from './GradientSelectionPreview';
import VertexGradientTransformControls from './VertexGradientTransformControls';

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

  return (
    <Box sx={{ display: 'grid', gap: 1.25, mt: 1 }}>
      <GradientSelectionPreview
        $gradientTransform={$gradientTransform}
        $gradientStartColor={$gradientStartColor}
        $gradientEndColor={$gradientEndColor}
        popoverAnchorEl={popoverAnchorEl}
      />
      <VertexGradientTransformControls
        $gradientTransform={$gradientTransform}
      />
    </Box>
  );
}
