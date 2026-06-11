import { useCallback, useEffect, useMemo } from 'react';
import { useHeldRepetitionTimer } from '@/hooks';
import { navToNextObject, navToPrevObject } from '../objectViewerSlice';
import { selectCanNavObjects, selectObjectIndex } from '@/selectors';
import { useAppDispatch, useAppSelector } from '@/storeTypings';

export default function useObjectNavUIControls() {
  const dispatch = useAppDispatch();
  const objectIndex = useAppSelector(selectObjectIndex);
  const canNavObjects = useAppSelector(selectCanNavObjects);

  const [onStartPrevObjectNav, onStopPrevObjectNav] = useHeldRepetitionTimer();
  const [onStartNextObjectNav, onStopNextObjectNav] = useHeldRepetitionTimer();

  useEffect(() => {
    window.addEventListener('mouseup', onStopPrevObjectNav);
    window.addEventListener('mouseup', onStopNextObjectNav);
    return () => {
      window.removeEventListener('mouseup', onStopPrevObjectNav);
      window.removeEventListener('mouseup', onStopNextObjectNav);
    };
  }, []);

  const onStartPrevObjectClick = useCallback(() => {
    onStartPrevObjectNav(() => {
      dispatch(navToPrevObject());
    });
  }, [objectIndex]);

  const onStartNextObjectClick = useCallback(() => {
    onStartNextObjectNav(() => {
      dispatch(navToNextObject());
    });
  }, [objectIndex]);

  const prevButtonProps = useMemo(
    () => ({
      onMouseDown: onStartPrevObjectClick,
      onMouseUp: onStopPrevObjectNav,
      disabled: !canNavObjects
    }),
    [canNavObjects, onStartPrevObjectClick, onStopPrevObjectNav]
  );

  const nextButtonProps = useMemo(
    () => ({
      onMouseDown: onStartNextObjectClick,
      onMouseUp: onStopNextObjectNav,
      disabled: !canNavObjects
    }),
    [canNavObjects, onStartNextObjectClick, onStopNextObjectNav]
  );

  const returnValue = useMemo(
    () => ({
      prevButtonProps,
      nextButtonProps
    }),
    [prevButtonProps, nextButtonProps]
  );

  return returnValue;
}
