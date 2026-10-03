import SceneOptionsContext from '@/contexts/SceneOptionsContext';
import { useHeldRepetitionTimer } from '@/hooks';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { useContext, useEffect, useRef } from 'react';
import { navToNextObject, navToPrevObject } from '../objectViewerStore';

/** controls left/right object nav as well as the cinematic mode shortcut */
export default function useObjectNavControls() {
  const { enableCinematicMode, setEnableCinematicMode } =
    useContext(SceneOptionsContext);
  const isLeftPressed = useKeyPress({ targetKey: 'ArrowLeft' });
  const isRightPressed = useKeyPress({ targetKey: 'ArrowRight' });
  const isControlPressed = useKeyPress({ targetKey: 'Control' });
  const isBackslashPressed = useKeyPress({ targetKey: '\\' });
  const wasCinematicModeTogglePressed = useRef(false);

  const [onStartPrevObjectNav, onStopPrevObjectNav] = useHeldRepetitionTimer();
  const [onStartNextObjectNav, onStopNextObjectNav] = useHeldRepetitionTimer();

  useEffect(() => {
    if (isLeftPressed) {
      onStartPrevObjectNav(() => {
        navToPrevObject();
      });
    } else {
      onStopPrevObjectNav();
    }
  }, [isLeftPressed]);

  useEffect(() => {
    if (isRightPressed) {
      onStartNextObjectNav(() => {
        navToNextObject();
      });
    } else {
      onStopNextObjectNav();
    }
  }, [isRightPressed]);

  useEffect(() => {
    const isCinematicModeTogglePressed = isControlPressed && isBackslashPressed;

    if (
      isCinematicModeTogglePressed &&
      !wasCinematicModeTogglePressed.current
    ) {
      setEnableCinematicMode(!enableCinematicMode);
    }

    wasCinematicModeTogglePressed.current = isCinematicModeTogglePressed;
  }, [
    enableCinematicMode,
    isBackslashPressed,
    isControlPressed,
    setEnableCinematicMode
  ]);
}
