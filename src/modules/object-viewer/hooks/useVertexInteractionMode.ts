import { useEffect, useState } from 'react';

export type SceneVertexInteractionMode = 'camera' | 'select';

const keyboardInputSelector = 'input, textarea, select, [contenteditable]';

const keyboardInputHasFocus = () =>
  document.activeElement?.matches(keyboardInputSelector) === true;

export default function useVertexInteractionMode(vertexModeEnabled: boolean) {
  const [vertexInteractionMode, setVertexInteractionMode] =
    useState<SceneVertexInteractionMode>('camera');

  useEffect(() => {
    if (!vertexModeEnabled) {
      return;
    }

    const handleVertexModeShortcut = (event: KeyboardEvent) => {
      if (event.repeat || keyboardInputHasFocus()) {
        return;
      }

      if (event.key.toLowerCase() === 'c') {
        setVertexInteractionMode('camera');
      } else if (event.key.toLowerCase() === 'v') {
        setVertexInteractionMode('select');
      }
    };

    window.addEventListener('keydown', handleVertexModeShortcut);

    return () => {
      window.removeEventListener('keydown', handleVertexModeShortcut);
    };
  }, [vertexModeEnabled]);

  return { vertexInteractionMode, setVertexInteractionMode };
}
