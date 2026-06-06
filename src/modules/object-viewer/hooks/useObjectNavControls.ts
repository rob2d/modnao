import { useContext, useEffect, useRef } from 'react';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { navToNextObject, navToPrevObject } from '../objectViewerSlice';
import { useAppDispatch } from '@/storeTypings';
import { UnknownAction } from '@reduxjs/toolkit';
import { useHeldRepetitionTimer } from '@/hooks';
import SceneOptionsContext from '@/contexts/SceneOptionsContext';

/** controls left/right object nav as well as hides and shows the gui menu */
export default function useObjectNavControls() {
  const dispatch = useAppDispatch();
  const { guiPanelExpansionLevel, setGuiPanelExpansionLevel } =
    useContext(SceneOptionsContext);
  const isLeftPressed = useKeyPress({ targetKey: 'ArrowLeft' });
  const isRightPressed = useKeyPress({ targetKey: 'ArrowRight' });
  const isControlPressed = useKeyPress({ targetKey: 'Control' });
  const isBackslashPressed = useKeyPress({ targetKey: '\\' });
  const lastVisibleGuiPanelExpansionLevel = useRef(
    guiPanelExpansionLevel > 0 ? guiPanelExpansionLevel : 1
  );
  const wasGuiPanelTogglePressed = useRef(false);

  const [onStartPrevObjectNav, onStopPrevObjectNav] = useHeldRepetitionTimer();
  const [onStartNextObjectNav, onStopNextObjectNav] = useHeldRepetitionTimer();

  useEffect(() => {
    if (guiPanelExpansionLevel > 0) {
      lastVisibleGuiPanelExpansionLevel.current = guiPanelExpansionLevel;
    }
  }, [guiPanelExpansionLevel]);

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
    const isGuiPanelTogglePressed = isControlPressed && isBackslashPressed;

    if (isGuiPanelTogglePressed && !wasGuiPanelTogglePressed.current) {
      setGuiPanelExpansionLevel(
        guiPanelExpansionLevel > 0
          ? 0
          : lastVisibleGuiPanelExpansionLevel.current
      );
    }

    wasGuiPanelTogglePressed.current = isGuiPanelTogglePressed;
  }, [
    guiPanelExpansionLevel,
    isBackslashPressed,
    isControlPressed,
    setGuiPanelExpansionLevel
  ]);
}
