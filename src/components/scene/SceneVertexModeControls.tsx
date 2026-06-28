import { mdiCameraControl, mdiLasso } from '@mdi/js';
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from '@mui/material';
import type { SceneVertexInteractionMode } from '@/modules/object-viewer';
import MdiSvgIcon from '../MdiSvgIcon';

interface SceneVertexModeControlsProps {
  value: SceneVertexInteractionMode;
  onChange: (mode: SceneVertexInteractionMode) => void;
}

export default function SceneVertexModeControls({
  value,
  onChange
}: SceneVertexModeControlsProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        mt: 1,
        mr: 1,
        zIndex: 2,
        pointerEvents: 'all'
      }}
    >
      <ToggleButtonGroup
        exclusive
        size='small'
        color='secondary'
        value={value}
        onChange={(_, nextMode: SceneVertexInteractionMode | null) => {
          if (!nextMode || nextMode === value) {
            return;
          }

          onChange(nextMode);
        }}
        aria-label='Vertex mode interaction controls'
        sx={{
          backgroundColor: 'var(--mui-palette-sceneControl-background)',
          backdropFilter: 'blur(8px)',
          '& .MuiToggleButton-root': {
            color: 'var(--mui-palette-text-primary)'
          },
          '& .Mui-selected': {
            backgroundColor:
              'var(--mui-palette-sceneControl-selectedBackground)'
          }
        }}
      >
        <Tooltip title='Move camera (⌨&nbsp;C)'>
          <ToggleButton value='camera' aria-label='Move camera'>
            <MdiSvgIcon path={mdiCameraControl} fontSize='small' />
          </ToggleButton>
        </Tooltip>
        <Tooltip title='Draw vertex selection area (⌨&nbsp;V)'>
          <ToggleButton value='select' aria-label='Draw vertex selection area'>
            <MdiSvgIcon path={mdiLasso} fontSize='small' />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </Box>
  );
}
