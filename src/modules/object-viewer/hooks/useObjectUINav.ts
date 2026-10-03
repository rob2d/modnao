import { useHeldRepetitionTimer } from '@/hooks';
import { $canNavObjects, $objectIndex } from '@/derivedState';
import { useCallback, useEffect, useMemo } from 'react';
import { navToNextObject, navToPrevObject } from '../objectViewerStore';

export default function useObjectNavUIControls() {
  'use no memo';

  const objectIndex = $objectIndex.value;
  const canNavObjects = $canNavObjects.value;

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
      navToPrevObject();
    });
  }, [objectIndex]);

  const onStartNextObjectClick = useCallback(() => {
    onStartNextObjectNav(() => {
      navToNextObject();
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
