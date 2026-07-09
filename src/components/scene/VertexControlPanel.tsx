import { useCallback, useEffect, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import {
  Box,
  Divider,
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

type VertexColorEditMode = 'editHsl' | 'pickColor' | 'gradientSelection';

const DEFAULT_HSL = {
  h: 0,
  s: 0,
  l: 0
};

interface VertexControlPanelProps {
  selectedVertexColors: VertexColorUpdate[];
  selectedVertexCount: number;
  onAdjustHsl: (payload: ApplySelectedVertexHslPayload) => void;
  onPickColor: (hexColor: string) => void;
}

export default function VertexControlPanel({
  selectedVertexColors,
  selectedVertexCount,
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
  const hasEditableVertices = selectedVertexColors.length > 0;
  const hasNonEditableSelectedVertices =
    selectedVertexCount > selectedVertexColors.length;
  const vertexEditabilityMessage = !hasEditableVertices
    ? 'No vertices with editable colors in selection.'
    : hasNonEditableSelectedVertices
      ? 'Some vertices selected do not have editable colors'
      : undefined;

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
        width: 320,
        zIndex: 2,
        pointerEvents: 'all',
        backgroundColor: 'var(--mui-palette-sceneControl-background)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <Box sx={{ px: 1.5, py: 1 }}>
        <Typography variant='subtitle2'>Vertex Color Edit</Typography>
        {!hasEditableVertices ? null : (
          <>
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
              <ToggleButton value='gradientSelection'>Gradient</ToggleButton>
            </ToggleButtonGroup>
            <Box sx={{ mt: 1 }}>
              {colorEditMode !== 'editHsl' ? null : (
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
              )}
              {colorEditMode !== 'pickColor' ? null : (
                <SketchPicker
                  color={selectedColor}
                  onChange={({ hex }) => setSelectedColor(hex)}
                  onChangeComplete={({ hex }) => onPickColor(hex)}
                />
              )}
              {colorEditMode !== 'gradientSelection' ? null : null}
            </Box>
          </>
        )}
        {!vertexEditabilityMessage ? null : (
          <>
            <Divider sx={{ mt: 1, borderColor: 'textDeemphasized' }} />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                mt: 1
              }}
            >
              <WarningAmberIcon
                fontSize='small'
                sx={{
                  flexShrink: 0,
                  mr: 1,
                  fill: 'var(--mui-palette-text-deemphasized)'
                }}
              />
              <Typography
                color='textDeemphasized'
                variant='body2'
                sx={{ flexGrow: 1, fontStyle: 'italic' }}
              >
                {vertexEditabilityMessage}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
}
