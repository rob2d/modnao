import { useCallback, useContext, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { navToNextModel, navToPrevModel } from '@/store';
import { AnyAction } from '@reduxjs/toolkit';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';

function useHeldRepetitionTimer(): [(action: () => void) => void, () => void] {
  const timeout = useRef<NodeJS.Timeout | null>(null);

  const disengageAction = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
  }, []);

  const engageRepeatedAction = useCallback((action: () => void) => {
    let delay = 400;
    const processAction = () => {
      action();
      timeout.current = setTimeout(processAction, delay);
      if (delay > 100) {
        delay -= 50;
      } else if (delay > 50) {
        delay -= 25;
      } else if (delay > 10) {
        delay -= 5;
      }
    };

    processAction();
  }, []);

  return [engageRepeatedAction, disengageAction];
}

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
