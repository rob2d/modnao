import { useKeyPress } from '@react-typed-hooks/use-key-press';
import { useEffect, useEffectEvent, useRef } from 'react';

interface UseKeyPressEffectOptions {
  disabled?: boolean;
}

export default function useKeyPressEffect(
  targetKey: string,
  effect: () => void,
  options?: UseKeyPressEffectOptions
) {
  const isKeyPressed = useKeyPress({ targetKey });
  const wasKeyPressed = useRef(false);
  const handleKeyPress = useEffectEvent(effect);

  useEffect(() => {
    if (options?.disabled) {
      wasKeyPressed.current = isKeyPressed;
      return;
    }

    if (isKeyPressed && !wasKeyPressed.current) {
      handleKeyPress();
    }

    wasKeyPressed.current = isKeyPressed;
  }, [handleKeyPress, isKeyPressed, options?.disabled]);
}
