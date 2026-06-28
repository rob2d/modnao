import { useState } from 'react';
import { SketchPicker } from 'react-color';
import {
  Box,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';

type VertexColorEditMode = 'hslAdjustment' | 'setValue' | 'applyGradient';

export default function VertexControlPanel() {
  const [colorEditMode, setColorEditMode] =
    useState<VertexColorEditMode>('hslAdjustment');
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
          <ToggleButton value='hslAdjustment'>Edit HSL</ToggleButton>
          <ToggleButton value='setValue'>Pick Color</ToggleButton>
          <ToggleButton value='applyGradient'>Pick Gradient</ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ mt: 1 }}>
          {colorEditMode !== 'setValue' ? (
            'PLACEHOLDER'
          ) : (
            <SketchPicker
              color={selectedColor}
              onChange={({ hex }: { hex: string }) => setSelectedColor(hex)}
            />
          )}
        </Box>
      </Box>
    </Paper>
  );
}
