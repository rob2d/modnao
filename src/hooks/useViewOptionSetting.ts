import { useState } from 'react';
import useDebouncedEffect from './useDebouncedEffect';

/**
 * creates a hook that allows for the setting of a value
 * with optional local storage persistence
 */
export default function useViewOptionSetting<T>(
  defaultValue: T,
  storageKey?: string
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    const { localStorage } = window;

    if (storageKey) {
      const storedValue = localStorage.getItem(storageKey);
      if (storedValue !== null) {
        switch (typeof defaultValue) {
          case 'string':
            return storedValue as T;
          case 'number':
            return Number(storedValue) as T;
          case 'boolean':
            return (storedValue === 'true') as T;
          default:
            return JSON.parse(storedValue) as T;
        }
      }
    }

    return defaultValue;
  });

  useDebouncedEffect(
    () => {
      if (storageKey) {
        switch (typeof value) {
          case 'string':
            localStorage.setItem(storageKey, value);
            break;
          case 'boolean':
          case 'number':
            localStorage.setItem(storageKey, `${value}`);
            break;
          case 'object':
            localStorage.setItem(storageKey, JSON.stringify(value));
            break;
        }
      }
    },
    [value],
    250
  );

  return [value, setValue];
}
