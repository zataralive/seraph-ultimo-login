import { useCallback } from 'react';

export const usePersistentData = () => {
  const loadData = useCallback(<T,>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      if (item) {
        if (key === 'achievedEndings' || key === 'unlockedStaffIds') {
          return new Set(JSON.parse(item)) as T;
        }
        return JSON.parse(item);
      }
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
    }
    return defaultValue;
  }, []);

  const saveData = useCallback(<T,>(key: string, data: T) => {
    try {
      if (data instanceof Set) {
        localStorage.setItem(key, JSON.stringify(Array.from(data)));
      } else {
        localStorage.setItem(key, JSON.stringify(data));
      }
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }, []);

  return { loadData, saveData };
};
