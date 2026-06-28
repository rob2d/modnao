import { type RefObject, useCallback, useState } from 'react';
import { useLassoPath } from '@/hooks';
import type { MeshSelectionType } from '@/modules/object-viewer';
import type { NodeSelectionMergeMode } from '@/types';
import type { InteractionPoint } from '@/utils/interaction';
import type { SceneVertexInteractionMode } from './SceneVertexModeControls';

interface CompletedLassoSelection {
  points: InteractionPoint[];
  selectionMergeMode: NodeSelectionMergeMode;
}

interface UseSceneVertexLassoSelectionOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  meshSelectionType: MeshSelectionType;
  onSelectVertices: (
    vertexKeys: string[],
    selectionMergeMode: NodeSelectionMergeMode
  ) => void;
  vertexInteractionMode: SceneVertexInteractionMode;
}

export default function useSceneVertexLassoSelection({
  canvasRef,
  meshSelectionType,
  onSelectVertices,
  vertexInteractionMode
}: UseSceneVertexLassoSelectionOptions) {
  const [completedLassoSelection, setCompletedLassoSelection] =
    useState<CompletedLassoSelection>();
  const lassoEnabled =
    meshSelectionType === 'vertex' && vertexInteractionMode === 'select';
  const onCompleteLasso = useCallback(
    (points: InteractionPoint[], selectionMergeMode: NodeSelectionMergeMode) =>
      setCompletedLassoSelection({
        points: [...points],
        selectionMergeMode
      }),
    []
  );
  const { isLassoActive, lassoPoints } = useLassoPath(canvasRef, {
    enabled: lassoEnabled,
    onComplete: onCompleteLasso
  });

  const onSelectLassoVertices = useCallback(
    (vertexKeys: string[], selectionMergeMode: NodeSelectionMergeMode) => {
      onSelectVertices(vertexKeys, selectionMergeMode);
      setCompletedLassoSelection(undefined);
    },
    [onSelectVertices]
  );

  return {
    completedLassoSelection,
    isLassoActive,
    lassoEnabled,
    lassoPoints,
    onSelectLassoVertices
  };
}
