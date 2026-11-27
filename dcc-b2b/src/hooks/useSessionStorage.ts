import { useCallback, useEffect, useState } from 'react';

/** Custom event name for intra-tab sessionStorage synchronization */
export const SESSION_STORAGE_EVENT = 'b2b-session-storage-updated';

/**
 * Custom event payload interface for sessionStorage updates
 */
export interface SessionStorageCustomEventDetail<T = unknown> {
  key: string;
  value: T;
}

/**
 * Dispatches a custom event when a sessionStorage item is mutated
 *
 * @param key - The sessionStorage key that was updated
 * @param value - The updated value
 */
export function dispatchSessionStorageEvent<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  const event = new CustomEvent<SessionStorageCustomEventDetail<T>>(
    SESSION_STORAGE_EVENT,
    {
      detail: { key, value },
    }
  );
  window.dispatchEvent(event);
}

/**
 * Hook for managing state backed by sessionStorage with real-time multi-component reactivity.
 *
 * @template T - The stored data type
 * @param key - The sessionStorage key
 * @param initialValue - Fallback value if key is not yet set
 * @returns A tuple of [value, setValue, removeValue]
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, (val: T | ((prev: T) => T)) => void, () => void] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      if (item !== null) {
        return JSON.parse(item) as T;
      }
    } catch {
      /** In case of parse error or restricted storage, return fallback */
    }

    const fallback =
      typeof initialValue === 'function'
        ? (initialValue as () => T)()
        : initialValue;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(fallback));
    } catch {
      /** Ignore write errors on initialization */
    }
    return fallback;
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        let currentValue: T = storedValue;
        if (typeof window !== 'undefined') {
          const raw = window.sessionStorage.getItem(key);
          if (raw !== null) {
            try {
              currentValue = JSON.parse(raw) as T;
            } catch {
              /** Use storedValue fallback */
            }
          }
        }

        const nextValue =
          typeof value === 'function'
            ? (value as (prev: T) => T)(currentValue)
            : value;

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(nextValue));
          dispatchSessionStorageEvent(key, nextValue);
        }
        setStoredValue(nextValue);
      } catch {
        /** Ignore storage write errors */
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
        const fallback =
          typeof initialValue === 'function'
            ? (initialValue as () => T)()
            : initialValue;
        setStoredValue(fallback);
        dispatchSessionStorageEvent(key, fallback);
      }
    } catch {
      /** Ignore storage removal errors */
    }
  }, [key, initialValue]);

  useEffect(() => {
    setStoredValue(readValue());
  }, [key, readValue]);

  useEffect(() => {
    const handleCustomEvent = (event: Event) => {
      const customEvent = event as CustomEvent<
        SessionStorageCustomEventDetail<T>
      >;
      if (customEvent.detail && customEvent.detail.key === key) {
        setStoredValue(customEvent.detail.value);
      }
    };

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.storageArea === window.sessionStorage && event.key === key) {
        if (event.newValue === null) {
          const fallback =
            typeof initialValue === 'function'
              ? (initialValue as () => T)()
              : initialValue;
          setStoredValue(fallback);
        } else {
          try {
            setStoredValue(JSON.parse(event.newValue) as T);
          } catch {
            /** Ignore parse errors */
          }
        }
      }
    };

    window.addEventListener(SESSION_STORAGE_EVENT, handleCustomEvent);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      window.removeEventListener(SESSION_STORAGE_EVENT, handleCustomEvent);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

export default useSessionStorage;
