import { useContext, useEffect } from 'react';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { navToNextObject, navToPrevObject, useAppDispatch } from '@/store';
import { AnyAction } from '@reduxjs/toolkit';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';
import useHeldRepetitionTimer from './useHeldRepetitionTimer';

/** controls left/right object nav as well as hides and shows the gui menu */
export default function useObjectNavControls() {
  const dispatch = useAppDispatch();
  const viewOptions = useContext(ViewOptionsContext);
  const isLeftPressed = useKeyPress({ targetKey: 'ArrowLeft' });
  const isRightPressed = useKeyPress({ targetKey: 'ArrowRight' });
  const isControlPressed = useKeyPress({ targetKey: 'Control' });
  const isSlashPressed = useKeyPress({ targetKey: '\\' });

  const [onStartPrevObjectNav, onStopPrevObjectNav] = useHeldRepetitionTimer();
  const [onStartNextObjectNav, onStopNextObjectNav] = useHeldRepetitionTimer();

  useEffect(() => {
    if (isLeftPressed) {
      onStartPrevObjectNav(() => {
        dispatch(navToPrevObject() as unknown as AnyAction);
      });
    } else {
      onStopPrevObjectNav();
    }
  }, [isLeftPressed]);

  useEffect(() => {
    if (isRightPressed) {
      onStartNextObjectNav(() => {
        dispatch(navToNextObject() as unknown as AnyAction);
      });
    } else {
      onStopNextObjectNav();
    }
  }, [isRightPressed]);

  useEffect(() => {
    if (isSlashPressed && isControlPressed) {
      viewOptions.setGuiPanelVisible(!viewOptions.guiPanelVisible);
    }
  }, [isSlashPressed, isControlPressed]);
}
