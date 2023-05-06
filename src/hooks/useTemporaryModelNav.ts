import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { selectModelCount, selectModelIndex } from '@/store/selectors';
import { setModelViewedIndex } from '@/store';

export default function useTemporaryModelNav() {
  const dispatch = useDispatch();
  const modelIndex = useSelector(selectModelIndex);
  const modelCount = useSelector(selectModelCount);
  const isLeftPressed = useKeyPress({ targetKey: 'ArrowLeft' });
  const isRightPressed = useKeyPress({ targetKey: 'ArrowRight' });

  useEffect(() => {
    if (isLeftPressed && modelIndex > 0) {
      dispatch(setModelViewedIndex(modelIndex - 1));
    }
  }, [isLeftPressed]);

  useEffect(() => {
    if (isRightPressed && modelIndex < modelCount - 1) {
      dispatch(setModelViewedIndex(modelIndex + 1));
    }
  }, [isRightPressed]);
}
