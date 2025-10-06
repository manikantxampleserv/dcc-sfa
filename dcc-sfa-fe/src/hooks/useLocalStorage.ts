import { useState } from 'react';

/**
 * A generic React hook to get and set an item in localStorage.
 *
 * @template T - The type of the value to store.
 * @param {string} key - The key under which the value is stored in localStorage.
 * @param {T} initialValue - The initial value to use if there is nothing in localStorage.
 * @returns {[T, (newValue: T | ((val: T) => T)) => void]} - Returns the current value and a setter function.
 *
 * @example
 * const [name, setName] = useLocalStorage<string>('username', 'Guest');
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setStoredValue = (newValue: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // handle error if needed
    }
  };

  return [value, setStoredValue] as const;
}
