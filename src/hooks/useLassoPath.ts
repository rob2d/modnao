import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  appendLassoPoint,
  DEFAULT_LASSO_POINT_DISTANCE,
  getInteractionBounds,
  type InteractionBounds,
  type InteractionPoint
} from '@/utils/interaction';

interface UseLassoPathOptions {
  enabled?: boolean;
  minPointDistance?: number;
  onComplete?: (points: InteractionPoint[], additive: boolean) => void;
}

interface UseLassoPathResult {
  isLassoActive: boolean;
  lassoBounds: InteractionBounds | undefined;
  lassoPoints: InteractionPoint[];
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
  const lassoPointsRef = useRef<InteractionPoint[]>([]);
  const additiveRef = useRef(false);
  const lassoBounds = useMemo(
    () => getInteractionBounds(lassoPoints),
    [lassoPoints]
  );

  const resetLasso = useCallback(() => {
    setIsLassoActive(false);
    lassoPointsRef.current = [];
    additiveRef.current = false;
    setLassoPoints([]);
  }, []);

  useEffect(() => {
    const element = ref.current;

    if (!enabled || !element) {
      resetLasso();
      return undefined;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      element.setPointerCapture(event.pointerId);
      const bounds = element.getBoundingClientRect();
      const firstPoint = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top
      };

      lassoPointsRef.current = [firstPoint];
      additiveRef.current = event.shiftKey;
      setIsLassoActive(true);
      setLassoPoints([firstPoint]);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!element.hasPointerCapture(event.pointerId)) {
        return;
      }

      const bounds = element.getBoundingClientRect();
      const nextPoint = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top
      };
      const nextPoints = appendLassoPoint(
        lassoPointsRef.current,
        nextPoint,
        minPointDistance
      );

      if (nextPoints === lassoPointsRef.current) {
        return;
      }

      lassoPointsRef.current = nextPoints;
      setLassoPoints(nextPoints);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!element.hasPointerCapture(event.pointerId)) {
        return;
      }

      element.releasePointerCapture(event.pointerId);
      setIsLassoActive(false);
      onComplete?.(lassoPointsRef.current, additiveRef.current);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (element.hasPointerCapture(event.pointerId)) {
        element.releasePointerCapture(event.pointerId);
      }

      resetLasso();
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [enabled, minPointDistance, onComplete, ref, resetLasso]);

  return {
    isLassoActive,
    lassoBounds,
    lassoPoints,
    resetLasso
  };
}
