import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import { memo } from 'react';
import type { Observable } from '@legendapp/state';
import { useValue } from '@legendapp/state/react';
import { Box, IconButton, Tooltip } from '@mui/material';
import NumericSliderInput from '@/components/NumericSliderInput';
import {
  clamp,
  DEFAULT_GRADIENT_ANGLE,
  DEFAULT_GRADIENT_PIVOT_POINT,
  DEFAULT_GRADIENT_TILT,
  GRADIENT_MAX_ANGLE,
  type GradientTransform
} from './GradientSelectionPreview';

interface VertexGradientTransformControlsProps {
  $gradientTransform: Observable<GradientTransform>;
}

function VertexGradientTransformControls({
  $gradientTransform
}: VertexGradientTransformControlsProps) {
  const { angle, tilt, pivotPoint } = useValue($gradientTransform);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', p: 0, gap: 1 }}>
      <NumericSliderInput
        labelTooltip='Gradient angle'
        label='Angle'
        labelSx={{ width: 32 }}
        defaultValue={DEFAULT_GRADIENT_ANGLE}
        min={0}
        max={GRADIENT_MAX_ANGLE}
        value={angle}
        onChange={(nextAngle) => {
          $gradientTransform.set({
            ...$gradientTransform.get(),
            angle: clamp(nextAngle, 0, GRADIENT_MAX_ANGLE)
          });
        }}
        inputSx={{ width: 60 }}
        additionalControls={
          <>
            <Tooltip title='Rotate angle left'>
              <IconButton
                size='small'
                color='secondary'
                onClick={() => {
                  $gradientTransform.set({
                    ...$gradientTransform.get(),
                    angle: clamp(angle - 45, 0, GRADIENT_MAX_ANGLE)
                  });
                }}
                aria-label='Rotate angle left'
              >
                <RotateLeftIcon fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Rotate angle right'>
              <IconButton
                size='small'
                color='secondary'
                onClick={() => {
                  $gradientTransform.set({
                    ...$gradientTransform.get(),
                    angle: clamp(angle + 45, 0, GRADIENT_MAX_ANGLE)
                  });
                }}
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
        value={tilt}
        onChange={(nextTilt) => {
          $gradientTransform.set({
            ...$gradientTransform.get(),
            tilt: clamp(nextTilt, -90, 90)
          });
        }}
        inputSx={{ width: 60 }}
        sx={{ mt: -1 }}
        additionalControls={
          <>
            <Tooltip title='Rotate tilt left'>
              <IconButton
                size='small'
                color='secondary'
                onClick={() => {
                  $gradientTransform.set({
                    ...$gradientTransform.get(),
                    tilt: clamp(tilt - 45, -90, 90)
                  });
                }}
                aria-label='Rotate tilt left'
              >
                <RotateLeftIcon fontSize='small' />
              </IconButton>
            </Tooltip>
            <Tooltip title='Rotate tilt right'>
              <IconButton
                size='small'
                color='secondary'
                onClick={() => {
                  $gradientTransform.set({
                    ...$gradientTransform.get(),
                    tilt: clamp(tilt + 45, -90, 90)
                  });
                }}
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
        value={pivotPoint}
        onChange={(nextPivotPoint) => {
          $gradientTransform.set({
            ...$gradientTransform.get(),
            pivotPoint: clamp(nextPivotPoint, 0, 1)
          });
        }}
        inputSx={{ width: 60 }}
        sx={{ mt: -1 }}
        additionalControls={<Box sx={{ width: 68 }} />}
      />
    </Box>
  );
}

export default VertexGradientTransformControls;
