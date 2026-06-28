import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { DisplayedMesh } from '@/selectors';
import type { NodeSelectionMergeMode } from '@/types';
import { getInteractionBounds, isPointInLasso } from '@/utils/interaction';
import type { InteractionPoint } from '@/utils/interaction';

interface SceneVertexLassoSelectionProps {
  lassoPoints: InteractionPoint[] | undefined;
  meshGroups: DisplayedMesh[][];
  renderAllModels: boolean;
  selectionMergeMode: NodeSelectionMergeMode;
  onSelectVertices: (
    vertexKeys: string[],
    selectionMergeMode: NodeSelectionMergeMode
  ) => void;
}

export default function SceneVertexLassoSelection({
  lassoPoints,
  meshGroups,
  renderAllModels,
  selectionMergeMode,
  onSelectVertices
}: SceneVertexLassoSelectionProps) {
  const { camera, size } = useThree();

  useEffect(() => {
    if (!lassoPoints || lassoPoints.length < 3) {
      return;
    }

    const lassoBounds = getInteractionBounds(lassoPoints);

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

            if (isPointInLasso(point, lassoPoints, lassoBounds)) {
              selectedVertexKeys.push(
                `${meshIndex}_${polygonIndex}_${vertexIndex}`
              );
            }
          });
        });
      });
    });

    onSelectVertices(selectedVertexKeys, selectionMergeMode);
  }, [
    camera,
    lassoPoints,
    meshGroups,
    onSelectVertices,
    renderAllModels,
    selectionMergeMode,
    size
  ]);

  return null;
}
