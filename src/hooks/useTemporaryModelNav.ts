import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { selectModelCount, selectModelIndex } from '@/store/selectors';
import { setModelViewedIndex } from '@/store';
import { AnyAction } from '@reduxjs/toolkit';

export default function useTemporaryModelNav() {
  const dispatch = useDispatch();
  const modelIndex = useSelector(selectModelIndex);
  const modelCount = useSelector(selectModelCount);
  const isLeftPressed = useKeyPress({ targetKey: 'ArrowLeft' });
  const isRightPressed = useKeyPress({ targetKey: 'ArrowRight' });

  // @TODO: sort out thunk action types
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
}
