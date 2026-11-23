import { useEffect, useState } from 'react';

/**
 * Works like useState, but the value is also saved in localStorage
 * so it survives a page refresh.
 */
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
      console.error('Could not save to localStorage', err);
    }
  }, [key, value]);

  return [value, setValue];
}
