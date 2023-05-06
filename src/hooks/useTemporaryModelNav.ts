import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { selectModelCount, selectModelViewedIndex } from '@/store/selectors';
import { setModelViewedIndex } from '@/store';

export default function useTemporaryModelNav() {
  const dispatch = useDispatch();
  const modelViewedIndex = useSelector(selectModelViewedIndex);
  const modelCount = useSelector(selectModelCount);
  const isLeftPressed = useKeyPress({ targetKey: 'ArrowLeft' });
  const isRightPressed = useKeyPress({ targetKey: 'ArrowRight' });

  useEffect(() => {
    if (isLeftPressed && modelViewedIndex > 0) {
      dispatch(setModelViewedIndex(modelViewedIndex - 1));
    }
  }, [isLeftPressed]);

  useEffect(() => {
    if (isRightPressed && modelViewedIndex < modelCount - 1) {
      dispatch(setModelViewedIndex(modelViewedIndex + 1));
    }
  }, [isRightPressed]);
}
