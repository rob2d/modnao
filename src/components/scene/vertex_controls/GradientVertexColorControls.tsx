import RotateLeftIcon from '@mui/icons-material/RotateLeft';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import { useCallback, useState } from 'react';
import { batch, useSignal } from '@preact-signals/safe-react';
import { Box, IconButton, Tooltip } from '@mui/material';
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
          inputSx={{ width: 56 }}
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
          inputSx={{ width: 56 }}
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
      </Box>
    </Box>
  );
}
