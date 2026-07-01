import { mdiCameraControl, mdiLasso } from '@mdi/js';
import { useCallback, useMemo } from 'react';
import {
  Box,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import SelectAllIcon from '@mui/icons-material/SelectAll';
import {
  type SceneVertexInteractionMode,
  setObjectKeys
} from '@/modules/object-viewer';
import { selectModel, selectSelectedObjectIds } from '@/selectors';
import { useAppDispatch, useAppSelector } from '@/storeTypings';
import MdiSvgIcon from '../MdiSvgIcon';

interface SceneVertexModeControlsProps {
  value: SceneVertexInteractionMode;
  onChange: (mode: SceneVertexInteractionMode) => void;
}

export default function SceneVertexModeControls({
  value,
  onChange
}: SceneVertexModeControlsProps) {
  const dispatch = useAppDispatch();
  const model = useAppSelector(selectModel);
  const selectedObjectIds = useAppSelector(selectSelectedObjectIds);
  const allVertexObjectKeys = useMemo(() => {
    if (!model) {
      return [];
    }

    return model.meshes.flatMap((mesh, meshIndex) =>
      mesh.polygons.flatMap((polygon, polygonIndex) =>
        polygon.vertices.map(
          (_, vertexIndex) => `${meshIndex}_${polygonIndex}_${vertexIndex}`
        )
      )
    );
  }, [model]);
  const hasSelectedVertices = Object.keys(selectedObjectIds).length > 0;
  const allVerticesSelected =
    allVertexObjectKeys.length > 0 &&
    allVertexObjectKeys.every((objectKey) => selectedObjectIds[objectKey]);

  const onSelectAllVertices = useCallback(() => {
    dispatch(setObjectKeys(allVertexObjectKeys));
  }, [allVertexObjectKeys, dispatch]);

  const onClearSelection = useCallback(() => {
    dispatch(setObjectKeys([]));
  }, [dispatch]);

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        mt: 1,
        mr: 1,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        zIndex: 2,
        pointerEvents: 'all'
      }}
    >
      {allVertexObjectKeys.length === 0 ? null : (
        <Box
          sx={{
            display: 'flex',
            backgroundColor: 'var(--mui-palette-sceneControl-background)',
            backdropFilter: 'blur(8px)',
            borderRadius: 1,
            overflow: 'hidden',
            '& .MuiIconButton-root': {
              width: 32,
              height: 32,
              borderRadius: 0,
              color: 'var(--mui-palette-text-primary)'
            },
            '& .MuiIconButton-root:hover': {
              backgroundColor:
                'var(--mui-palette-sceneControl-selectedBackground)'
            },
            '& .MuiIconButton-root.Mui-disabled': {
              color: 'var(--mui-palette-action-disabled)'
            },
            '& .MuiSvgIcon-root': {
              fontSize: 18
            }
          }}
        >
          <Tooltip title='Select all vertices'>
            <span>
              <IconButton
                aria-label='Select all vertices'
                color='secondary'
                disabled={allVerticesSelected}
                onClick={onSelectAllVertices}
                size='small'
              >
                <SelectAllIcon fontSize='small' />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title='Clear vertex selection'>
            <span>
              <IconButton
                aria-label='Clear vertex selection'
                color='secondary'
                disabled={!hasSelectedVertices}
                onClick={onClearSelection}
                size='small'
              >
                <ClearIcon fontSize='small' />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      )}
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
