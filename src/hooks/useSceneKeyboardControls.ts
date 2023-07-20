import { useContext, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { navToNextModel, navToPrevModel } from '@/store';
import { AnyAction } from '@reduxjs/toolkit';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import useHeldRepetitionTimer from './useHeldRepetitionTimer';

export default function useSceneKeyboardControls() {
  const dispatch = useDispatch();
  const viewOptions = useContext(ViewOptionsContext);
  const isLeftPressed = useKeyPress({ targetKey: 'ArrowLeft' });
  const isRightPressed = useKeyPress({ targetKey: 'ArrowRight' });
  const isControlPressed = useKeyPress({ targetKey: 'Control' });
  const isSlashPressed = useKeyPress({ targetKey: '\\' });

  const [onStartPrevModelNav, onStopPrevModelNav] = useHeldRepetitionTimer();
  const [onStartNextModelNav, onStopNextModelNav] = useHeldRepetitionTimer();

  useEffect(() => {
    if (isLeftPressed) {
      onStartPrevModelNav(() => {
        dispatch(navToPrevModel() as unknown as AnyAction);
      });
    } else {
      onStopPrevModelNav();
    }
  }, [isLeftPressed]);

  useEffect(() => {
    if (isRightPressed) {
      onStartNextModelNav(() => {
        dispatch(navToNextModel() as unknown as AnyAction);
      });
    } else {
      onStopNextModelNav();
    }
  }, [isRightPressed]);

  useEffect(() => {
    if (isSlashPressed && isControlPressed) {
      viewOptions.setGuiPanelVisible(!viewOptions.guiPanelVisible);
    }
  }, [isSlashPressed, isControlPressed]);
}
