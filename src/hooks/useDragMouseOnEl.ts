import { useCallback, useEffect, useRef, useState } from 'react';

export interface MouseMovementPos {
  x: number;
  y: number;
}

const useDragMouseOnEl = (
  ref: React.RefObject<HTMLElement>
): [MouseMovementPos, boolean, () => void] => {
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [movement, setMovement] = useState<MouseMovementPos>({ x: 0, y: 0 });
  const startPos = useRef<MouseMovementPos>({ x: 0, y: 0 });
  const lastMousePos = useRef<MouseMovementPos>({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      if (ref.current && ref.current.contains(event.target as Node)) {
        startPos.current = { x: event.clientX, y: event.clientY };
        setMovement({ x: 0, y: 0 });
        setIsMouseDown(true);
      }
    },
    [ref]
  );

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
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
    setIsMouseDown(false);
    setTimeout(() => {
      setMovement({ x: 0, y: 0 });
      startPos.current = lastMousePos.current;
      setIsMouseDown(true);
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
