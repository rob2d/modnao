import { useContext, useEffect, useRef } from 'react';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { navToNextObject, navToPrevObject } from '../objectViewerSlice';
import { useAppDispatch } from '@/storeTypings';
import { UnknownAction } from '@reduxjs/toolkit';
import { useHeldRepetitionTimer } from '@/hooks';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';

/** controls left/right object nav as well as the cinematic mode shortcut */
export default function useObjectNavControls() {
  const dispatch = useAppDispatch();
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
        dispatch(navToPrevObject() as unknown as UnknownAction);
      });
    } else {
      onStopPrevObjectNav();
    }
  }, [isLeftPressed]);

  useEffect(() => {
    if (isRightPressed) {
      onStartNextObjectNav(() => {
        dispatch(navToNextObject() as unknown as UnknownAction);
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
