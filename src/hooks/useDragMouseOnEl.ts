import { useCallback, useEffect, useRef, useState } from 'react';

export interface MouseMovementPos {
  x: number;
  y: number;
}

let mouseDownOverall = false;
if (typeof window !== 'undefined') {
  document.addEventListener('mousedown', () => {
    mouseDownOverall = true;
  });

  document.addEventListener('mouseup', () => {
    mouseDownOverall = false;
  });
}

const useDragMouseOnEl = (
  ref: React.RefObject<HTMLElement>
): [MouseMovementPos, boolean, () => void] => {
  const [isMouseDown, setMouseDown] = useState(false);
  const [movement, setMovement] = useState<MouseMovementPos>({ x: 0, y: 0 });
  const startPos = useRef<MouseMovementPos>({ x: 0, y: 0 });
  const lastMousePos = useRef<MouseMovementPos>({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (ref.current && ref.current.contains(event.target as Node)) {
        startPos.current = { x: event.clientX, y: event.clientY };
        setMovement({ x: 0, y: 0 });
        setMouseDown(true);
      }
    },
    [ref]
  );

  const handleMouseUp = useCallback(() => {
    setMouseDown(false);
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (isMouseDown) {
        const deltaX = event.clientX - startPos.current.x;
        const deltaY = event.clientY - startPos.current.y;
        lastMousePos.current = { x: event.clientX, y: event.clientY };
        setMovement({ x: deltaX, y: deltaY });
      }
    },
    [isMouseDown]
  );

  const handleResetTracking = useCallback(() => {
    setMouseDown(false);
    setTimeout(() => {
      if (mouseDownOverall) {
        setMovement({ x: 0, y: 0 });
        startPos.current = lastMousePos.current;
        setMouseDown(true);
      }
    }, 0);
  }, []);

  useEffect(() => {
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleMouseDown, handleMouseUp, handleMouseMove]);

  return [movement, isMouseDown, handleResetTracking];
};

export default useDragMouseOnEl;
