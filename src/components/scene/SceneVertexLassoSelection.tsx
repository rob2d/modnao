import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { DisplayedMesh } from '@/selectors';
import {
  getInteractionBounds,
  type InteractionPoint,
  isPointInLasso
} from '@/utils/interaction';

interface SceneVertexLassoSelectionProps {
  additiveSelection: boolean;
  lassoPoints: InteractionPoint[] | undefined;
  meshGroups: DisplayedMesh[][];
  renderAllModels: boolean;
  onSelectVertexKeys: (vertexKeys: string[], additive: boolean) => void;
}

export default function SceneVertexLassoSelection({
  additiveSelection,
  lassoPoints,
  meshGroups,
  renderAllModels,
  onSelectVertexKeys
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

    onSelectVertexKeys(selectedVertexKeys, additiveSelection);
  }, [
    additiveSelection,
    camera,
    lassoPoints,
    meshGroups,
    onSelectVertexKeys,
    renderAllModels,
    size
  ]);

  return null;
}
