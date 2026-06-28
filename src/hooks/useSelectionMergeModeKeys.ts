import { type RefObject, useEffect, useState } from 'react';
import type { NodeSelectionMergeMode } from '@/types';

export default function useSelectionMergeModeKeys(
  isScenePointerInsideRef: RefObject<boolean>
): NodeSelectionMergeMode {
  const [isAltPressed, setIsAltPressed] = useState(false);
  const [isShiftPressed, setIsShiftPressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Alt') {
        if (isScenePointerInsideRef.current) {
          event.preventDefault();
        }

        setIsAltPressed(true);
      }

      if (event.key === 'Shift') {
        setIsShiftPressed(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Alt') {
        if (isScenePointerInsideRef.current) {
          event.preventDefault();
        }

        setIsAltPressed(false);
      }

      if (event.key === 'Shift') {
        setIsShiftPressed(false);
      }
    };

    const handleWindowBlur = () => {
      setIsAltPressed(false);
      setIsShiftPressed(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [isScenePointerInsideRef]);

  if (isAltPressed) {
    return 'remove';
  }

  if (isShiftPressed) {
    return 'add';
  }

  return 'replace';
}
