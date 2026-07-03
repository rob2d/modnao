import { type RefObject, useCallback, useEffect } from 'react';
import { Box } from '@mui/material';
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
import type { SceneVertexInteractionMode } from '@/modules/object-viewer';

const MIN_LASSO_BOUNDS_SIZE = 8;

interface SceneLassoOverlayBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface SceneLassoOverlayState {
  isActive: boolean;
  points: InteractionPoint[];
  viewportBounds: SceneLassoOverlayBounds;
}

interface SceneLassoSelectionProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  meshGroups: DisplayedMesh[][];
  meshSelectionType: MeshSelectionType;
  onOverlayChange: (overlay: SceneLassoOverlayState | undefined) => void;
  vertexInteractionMode: SceneVertexInteractionMode;
}

export default function SceneLassoSelection({
  canvasRef,
  meshGroups,
  meshSelectionType,
  onOverlayChange,
  vertexInteractionMode
}: SceneLassoSelectionProps) {
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

      if (
        lassoBounds.maxX - lassoBounds.minX < MIN_LASSO_BOUNDS_SIZE ||
        lassoBounds.maxY - lassoBounds.minY < MIN_LASSO_BOUNDS_SIZE
      ) {
        return;
      }

      const selectedVertexKeys: string[] = [];
      const projectedVertex = new Vector3();

      meshGroups.forEach((meshes, meshGroupIndex) => {
        meshes.forEach((mesh, meshIndex) => {
          mesh.polygons.forEach((polygon, polygonIndex) => {
            polygon.vertices.forEach((vertex, vertexIndex) => {
              projectedVertex
                .set(vertex.position[0], vertex.position[1], vertex.position[2])
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
    [camera, dispatch, meshGroups, size]
  );
  const { isLassoActive, lassoPoints, lassoViewportBounds } = useLassoPath(
    canvasRef,
    {
      enabled: lassoEnabled,
      onComplete: onCompleteLasso
    }
  );

  useEffect(() => {
    if (!lassoEnabled || lassoPoints.length < 2 || !lassoViewportBounds) {
      onOverlayChange(undefined);

      return;
    }

    onOverlayChange({
      isActive: isLassoActive,
      points: lassoPoints,
      viewportBounds: lassoViewportBounds
    });
  }, [
    isLassoActive,
    lassoEnabled,
    lassoPoints,
    lassoViewportBounds,
    onOverlayChange
  ]);

  useEffect(
    () => () => {
      onOverlayChange(undefined);
    },
    [onOverlayChange]
  );

  return null;
}

interface SceneLassoOverlayProps {
  overlay: SceneLassoOverlayState | undefined;
}

export function SceneLassoOverlay({ overlay }: SceneLassoOverlayProps) {
  if (!overlay) {
    return null;
  }

  const pointList = overlay.points.map(({ x, y }) => `${x},${y}`).join(' ');
  const fillOpacity = overlay.isActive ? 0.16 : 0.08;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: overlay.viewportBounds.top,
        left: overlay.viewportBounds.left,
        width: overlay.viewportBounds.width,
        height: overlay.viewportBounds.height,
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
  );
}
