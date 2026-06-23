import { useCallback, useState, useSyncExternalStore } from 'react';

const storageKeyListeners = new Map<string, Set<() => void>>();
const storageSnapshotCache = new Map<
  string,
  { storedValue: string | null; parsedValue: unknown }
>();

function parseStoredValue<T>(defaultValue: T, storedValue: string): T {
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

function writeStoredValue<T>(storageKey: string, value: T) {
  switch (typeof value) {
    case 'undefined':
      localStorage.removeItem(storageKey);
      break;
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

function readStoredValue<T>(defaultValue: T, storageKey?: string): T {
  if (!storageKey || typeof window === 'undefined') {
    return defaultValue;
  }

  const storedValue = window.localStorage.getItem(storageKey);
  const cachedSnapshot = storageSnapshotCache.get(storageKey);

  if (cachedSnapshot?.storedValue === storedValue) {
    return cachedSnapshot.parsedValue as T;
  }

  const parsedValue =
    storedValue === null
      ? defaultValue
      : parseStoredValue(defaultValue, storedValue);

  storageSnapshotCache.set(storageKey, { storedValue, parsedValue });

  return parsedValue;
}

function notifyStorageKeyListeners(storageKey: string) {
  storageKeyListeners.get(storageKey)?.forEach((listener) => listener());
}

/**
 * creates a hook that allows for the setting of a value
 * with optional local storage persistence
 */
export default function useSceneOptionSetting<T>(
  defaultValue: T,
  storageKey?: string
): [T, (value: T) => void] {
  const [localValue, setLocalValue] = useState<T>(() => defaultValue);

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!storageKey || typeof window === 'undefined') {
        return () => undefined;
      }

      const listeners =
        storageKeyListeners.get(storageKey) ?? new Set<() => void>();

      listeners.add(onStoreChange);
      storageKeyListeners.set(storageKey, listeners);

      const onStorage = (event: StorageEvent) => {
        if (event.key === storageKey) {
          onStoreChange();
        }
      };

      window.addEventListener('storage', onStorage);

      return () => {
        listeners.delete(onStoreChange);

        if (listeners.size === 0) {
          storageKeyListeners.delete(storageKey);
        }

        window.removeEventListener('storage', onStorage);
      };
    },
    [storageKey]
  );

  const storedValue = useSyncExternalStore(
    subscribe,
    () => readStoredValue(defaultValue, storageKey),
    () => defaultValue
  );

  const setStoredValue = useCallback(
    (value: T) => {
      if (!storageKey) {
        return;
      }

      writeStoredValue(storageKey, value);
      notifyStorageKeyListeners(storageKey);
    },
    [storageKey]
  );

  return storageKey
    ? [storedValue, setStoredValue]
    : [localValue, setLocalValue];
}
