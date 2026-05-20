import { useCallback, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : initialValue;
    }
    catch {
      return initialValue;
    }
  });

  const set = useCallback(
    (value: ((prev: T) => T) | T) => {
      setState((prev) => {
        const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        }
        catch (error) {
          console.error(error);
        }
        return next;
      });
    },
    [key],
  );

  return [state, set] as const;
}
