import { useCallback, useRef } from 'react';

export default function useHeldRepetitionTimer(): [
  (action: () => void) => void,
  () => void
] {
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
