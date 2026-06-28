import { type RefObject, useCallback } from 'react';
import { Box } from '@mui/material';
import { Html } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { DisplayedMesh } from '@/selectors';
import {
  type MeshSelectionType,
  selectObjectKeys
} from '@/modules/object-viewer';
import { useLassoPath } from '@/hooks';
import { useAppDispatch } from '@/storeTypings';
import type { NodeSelectionMergeMode } from '@/types';
import { getInteractionBounds, isPointInLasso } from '@/utils/interaction';
import type { InteractionPoint } from '@/utils/interaction';
import type { SceneVertexInteractionMode } from './SceneVertexModeControls';

interface SceneLassoOverlayProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  meshGroups: DisplayedMesh[][];
  meshSelectionType: MeshSelectionType;
  renderAllModels: boolean;
  vertexInteractionMode: SceneVertexInteractionMode;
}

export default function SceneLassoOverlay({
  canvasRef,
  meshGroups,
  meshSelectionType,
  renderAllModels,
  vertexInteractionMode
}: SceneLassoOverlayProps) {
  const { camera, size } = useThree();
  const dispatch = useAppDispatch();
  const lassoEnabled =
    meshSelectionType === 'vertex' && vertexInteractionMode === 'select';
  const onCompleteLasso = useCallback(
    (
      points: InteractionPoint[],
      selectionMergeMode: NodeSelectionMergeMode
    ) => {
      if (points.length < 3) {
        return;
      }

      const lassoBounds = getInteractionBounds(points);

      if (!lassoBounds) {
        return;
      }

      const selectedVertexKeys: string[] = [];
      const projectedVertex = new Vector3();

      meshGroups.forEach((meshes, meshGroupIndex) => {
        const groupX = renderAllModels ? meshGroupIndex * 500 : 0;
        const groupY = renderAllModels ? meshGroupIndex * 50 : 0;

        meshes.forEach((mesh, meshIndex) => {
          mesh.polygons.forEach((polygon, polygonIndex) => {
            polygon.vertices.forEach((vertex, vertexIndex) => {
              projectedVertex
                .set(
                  vertex.position[0] + groupX,
                  vertex.position[1] + groupY,
                  vertex.position[2]
                )
                .project(camera);

              if (projectedVertex.z < -1 || projectedVertex.z > 1) {
                return;
              }

              const point = {
                x: (projectedVertex.x * 0.5 + 0.5) * size.width,
                y: (-projectedVertex.y * 0.5 + 0.5) * size.height
              };

              if (isPointInLasso(point, points, lassoBounds)) {
                selectedVertexKeys.push(
                  `${meshIndex}_${polygonIndex}_${vertexIndex}`
                );
              }
            });
          });
        });
      });

      dispatch(
        selectObjectKeys({
          objectKeys: selectedVertexKeys,
          selectionMergeMode
        })
      );
    },
    [camera, dispatch, meshGroups, renderAllModels, size]
  );
  const { isLassoActive, lassoPoints } = useLassoPath(canvasRef, {
    enabled: lassoEnabled,
    onComplete: onCompleteLasso
  });

  if (!lassoEnabled || lassoPoints.length < 2) {
    return null;
  }

  const pointList = lassoPoints.map(({ x, y }) => `${x},${y}`).join(' ');
  const fillOpacity = isLassoActive ? 0.16 : 0.08;

  return (
    <Html fullscreen style={{ pointerEvents: 'none' }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          overflow: 'hidden',
          pointerEvents: 'none',
          '& > svg': {
            display: 'block'
          }
        }}
      >
        <svg width='100%' height='100%' aria-hidden='true'>
          <polygon
            points={pointList}
            fill='var(--mui-palette-scene-selected)'
            fillOpacity={fillOpacity}
            stroke='var(--mui-palette-scene-selected)'
            strokeDasharray='6 4'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            vectorEffect='non-scaling-stroke'
          />
          <polyline
            points={pointList}
            fill='none'
            stroke='var(--mui-palette-common-white)'
            strokeDasharray='6 4'
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={1}
            strokeOpacity={0.75}
            vectorEffect='non-scaling-stroke'
          />
        </svg>
      </Box>
    </Html>
  );
}
