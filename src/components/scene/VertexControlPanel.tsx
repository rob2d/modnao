import { useCallback, useEffect, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  Box,
  List,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
import { useThrottle } from '@uidotdev/usehooks';
import NumericSliderInput from '@/components/NumericSliderInput';
import type {
  ApplySelectedVertexHslPayload,
  VertexColorUpdate
} from '@/modules/model-data';
import type { HslValues } from '@/utils/textures';

type VertexColorEditMode = 'editHsl' | 'pickColor' | 'pickGradient';

const DEFAULT_HSL = {
  h: 0,
  s: 0,
  l: 0
};

interface VertexControlPanelProps {
  selectedVertexColors: VertexColorUpdate[];
  onAdjustHsl: (payload: ApplySelectedVertexHslPayload) => void;
  onPickColor: (hexColor: string) => void;
}

export default function VertexControlPanel({
  selectedVertexColors,
  onAdjustHsl,
  onPickColor
}: VertexControlPanelProps) {
  const [colorEditMode, setColorEditMode] =
    useState<VertexColorEditMode>('editHsl');
  const [hsl, setHsl] = useState<HslValues>(DEFAULT_HSL);
  const [baseVertexColors, setBaseVertexColors] =
    useState(selectedVertexColors);
  const [selectedColor, setSelectedColor] = useState('#ffffff');
  const selectedVertexColorsRef = useRef(selectedVertexColors);
  const processedHsl = useThrottle(hsl, 75);

  useEffect(() => {
    selectedVertexColorsRef.current = selectedVertexColors;
  }, [selectedVertexColors]);

  useEffect(() => {
    if (colorEditMode !== 'editHsl' || baseVertexColors.length === 0) {
      return;
    }

    onAdjustHsl({
      baseVertexColors,
      hsl: processedHsl
    });
  }, [baseVertexColors, colorEditMode, onAdjustHsl, processedHsl]);

  const onSetH = useCallback((h: number) => {
    setHsl((prev) => ({ ...prev, h }));
  }, []);

  const onSetS = useCallback((s: number) => {
    setHsl((prev) => ({ ...prev, s }));
  }, []);

  const onSetL = useCallback((l: number) => {
    setHsl((prev) => ({ ...prev, l }));
  }, []);

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: 'calc(var(--mui-spacing) * 6)',
        right: 'var(--mui-spacing)',
        width: 240,
        zIndex: 2,
        pointerEvents: 'all',
        backgroundColor: 'var(--mui-palette-sceneControl-background)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <Box sx={{ px: 1.5, py: 1 }}>
        <Typography variant='subtitle2'>Vertex Color Edit</Typography>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size='small'
          color='secondary'
          value={colorEditMode}
          onChange={(_, nextMode: VertexColorEditMode | null) => {
            if (!nextMode || nextMode === colorEditMode) {
              return;
            }

            if (nextMode === 'editHsl') {
              setHsl(DEFAULT_HSL);
              setBaseVertexColors(selectedVertexColorsRef.current);
            }

            setColorEditMode(nextMode);
          }}
          aria-label='Vertex color edit mode'
          sx={{ mt: 1 }}
        >
          <ToggleButton value='editHsl'>Edit HSL</ToggleButton>
          <ToggleButton value='pickColor'>Pick Color</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ mt: 1 }}>
          {colorEditMode === 'editHsl' ? (
            <List sx={{ p: 0 }}>
              <NumericSliderInput
                labelTooltip='Hue'
                label='H'
                defaultValue={0}
                min={-180}
                max={180}
                value={hsl.h}
                onChange={onSetH}
              />
              <NumericSliderInput
                labelTooltip='Saturation'
                label='S'
                defaultValue={0}
                min={-100}
                max={100}
                value={hsl.s}
                onChange={onSetS}
              />
              <NumericSliderInput
                labelTooltip='Lightness'
                label='L'
                defaultValue={0}
                min={-100}
                max={100}
                value={hsl.l}
                onChange={onSetL}
              />
            </List>
          ) : colorEditMode === 'pickColor' ? (
            <SketchPicker
              color={selectedColor}
              onChange={({ hex }: { hex: string }) => setSelectedColor(hex)}
              onChangeComplete={({ hex }: { hex: string }) => onPickColor(hex)}
            />
          ) : (
            'PLACEHOLDER'
          )}
        </Box>
      </Box>
    </Paper>
  );
}
