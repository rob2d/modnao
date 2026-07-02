import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  appendLassoPoint,
  DEFAULT_LASSO_POINT_DISTANCE,
  getInteractionBounds,
  type InteractionBounds,
  type InteractionPoint
} from '@/utils/interaction';
import type { NodeSelectionMergeMode } from '@/types';

interface UseLassoPathOptions {
  enabled?: boolean;
  minPointDistance?: number;
  onComplete?: (
    points: InteractionPoint[],
    selectionMergeMode: NodeSelectionMergeMode
  ) => void;
}

interface LassoViewportBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface UseLassoPathResult {
  isLassoActive: boolean;
  lassoBounds: InteractionBounds | undefined;
  lassoPoints: InteractionPoint[];
  lassoViewportBounds: LassoViewportBounds | undefined;
  resetLasso: () => void;
}

export default function useLassoPath<TElement extends HTMLElement>(
  ref: React.RefObject<TElement | null>,
  {
    enabled = true,
    minPointDistance = DEFAULT_LASSO_POINT_DISTANCE,
    onComplete
  }: UseLassoPathOptions = {}
): UseLassoPathResult {
  const [isLassoActive, setIsLassoActive] = useState(false);
  const [lassoPoints, setLassoPoints] = useState<InteractionPoint[]>([]);
  const [lassoViewportBounds, setLassoViewportBounds] = useState<
    LassoViewportBounds | undefined
  >();
  const lassoPointsRef = useRef<InteractionPoint[]>([]);
  const onCompleteRef = useRef(onComplete);
  const selectionMergeModeRef = useRef<NodeSelectionMergeMode>('replace');
  const lassoBounds = useMemo(
    () => getInteractionBounds(lassoPoints),
    [lassoPoints]
  );

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const resetLasso = useCallback(() => {
    setIsLassoActive(false);
    lassoPointsRef.current = [];
    selectionMergeModeRef.current = 'replace';
    setLassoPoints([]);
    setLassoViewportBounds(undefined);
  }, []);

  useEffect(() => {
    const element = ref.current;

    if (!enabled || !element) {
      return undefined;
    }

    let activePointerId: number | undefined;

    const getElementBounds = () => {
      const bounds = element.getBoundingClientRect();

      return {
        left: bounds.left,
        top: bounds.top,
        width: bounds.width,
        height: bounds.height
      };
    };

    const getLassoPoint = (
      event: PointerEvent,
      bounds = getElementBounds()
    ) => ({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top
    });

    const removeWindowListeners = () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      const nextPoints = appendLassoPoint(
        lassoPointsRef.current,
        getLassoPoint(event),
        minPointDistance
      );

      if (nextPoints === lassoPointsRef.current) {
        return;
      }

      lassoPointsRef.current = nextPoints;
      setLassoPoints(nextPoints);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      const completedPoints = [...lassoPointsRef.current];
      const completedSelectionMergeMode = selectionMergeModeRef.current;

      activePointerId = undefined;
      removeWindowListeners();
      resetLasso();
      onCompleteRef.current?.(completedPoints, completedSelectionMergeMode);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (activePointerId !== event.pointerId) {
        return;
      }

      event.preventDefault();
      activePointerId = undefined;
      removeWindowListeners();
      resetLasso();
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch' && activePointerId !== undefined) {
        activePointerId = undefined;
        removeWindowListeners();
        resetLasso();

        return;
      }

      if (event.button !== 0 || activePointerId !== undefined) {
        return;
      }

      event.preventDefault();
      activePointerId = event.pointerId;
      const bounds = getElementBounds();
      const firstPoint = getLassoPoint(event, bounds);

      setLassoViewportBounds(bounds);

      lassoPointsRef.current = [firstPoint];
      if (event.altKey) {
        selectionMergeModeRef.current = 'remove';
      } else if (event.shiftKey) {
        selectionMergeModeRef.current = 'add';
      } else {
        selectionMergeModeRef.current = 'replace';
      }

      setIsLassoActive(true);
      setLassoPoints([firstPoint]);

      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      window.addEventListener('pointercancel', handlePointerCancel);
    };

    element.addEventListener('pointerdown', handlePointerDown);

    return () => {
      activePointerId = undefined;
      removeWindowListeners();
      element.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [enabled, minPointDistance, ref, resetLasso]);

  return {
    isLassoActive: enabled && isLassoActive,
    lassoBounds: enabled ? lassoBounds : undefined,
    lassoPoints: enabled ? lassoPoints : [],
    lassoViewportBounds: enabled ? lassoViewportBounds : undefined,
    resetLasso
  };
}
