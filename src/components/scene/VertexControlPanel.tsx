import { useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';

type VertexColorEditMode = 'editHsl' | 'pickColor' | 'pickGradient';

interface VertexControlPanelProps {
  onPickColor: (hexColor: string) => void;
}

export default function VertexControlPanel({
  onPickColor
}: VertexControlPanelProps) {
  const [colorEditMode, setColorEditMode] =
    useState<VertexColorEditMode>('editHsl');
  const [selectedColor, setSelectedColor] = useState('#ffffff');

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

            setColorEditMode(nextMode);
          }}
          aria-label='Vertex color edit mode'
          sx={{ mt: 1 }}
        >
          <ToggleButton value='editHsl'>Edit HSL</ToggleButton>
          <ToggleButton value='pickColor'>Pick Color</ToggleButton>
          <ToggleButton value='pickGradient'>Pick Gradient</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ mt: 1 }}>
          {colorEditMode !== 'pickColor' ? (
            'PLACEHOLDER'
          ) : (
            <SketchPicker
              color={selectedColor}
              onChange={({ hex }: { hex: string }) => setSelectedColor(hex)}
              onChangeComplete={({ hex }: { hex: string }) => onPickColor(hex)}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}
