import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { selectModelCount, selectModelIndex } from '@/store/selectors';
import { setModelViewedIndex } from '@/store';
import { AnyAction } from '@reduxjs/toolkit';
import ViewOptionsContext from '@/contexts/ViewOptionsContext';

export default function useSceneKeyboardControls() {
  const dispatch = useDispatch();
  const viewOptions = useContext(ViewOptionsContext);
  const modelIndex = useSelector(selectModelIndex);
  const modelCount = useSelector(selectModelCount);
  const isLeftPressed = useKeyPress({ targetKey: 'ArrowLeft' });
  const isRightPressed = useKeyPress({ targetKey: 'ArrowRight' });
  const isControlPressed = useKeyPress({ targetKey: 'Control' });
  const isSlashPressed = useKeyPress({ targetKey: '\\' });

  useEffect(() => {
    if (isLeftPressed && modelIndex > 0) {
      dispatch(setModelViewedIndex(modelIndex - 1) as unknown as AnyAction);
    }
  }, [isLeftPressed]);

  useEffect(() => {
    if (isRightPressed && modelIndex < modelCount - 1) {
      dispatch(setModelViewedIndex(modelIndex + 1) as unknown as AnyAction);
    }
  }, [isRightPressed]);

  useEffect(() => {
    if (isSlashPressed && isControlPressed) {
      viewOptions.setGuiPanelVisible(!viewOptions.guiPanelVisible);
    }
  }, [isSlashPressed, isControlPressed]);
}
