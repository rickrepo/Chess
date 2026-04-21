import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export function useAsyncStorage<T>(
  key: string,
  initial: T
): [T, (v: T) => void, boolean] {
  const [value, setValueState] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (cancelled) return;
        if (raw != null) {
          try {
            setValueState(JSON.parse(raw) as T);
          } catch {
            // ignore corrupt value
          }
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [key]);

  const setValue = useCallback(
    (v: T) => {
      setValueState(v);
      AsyncStorage.setItem(key, JSON.stringify(v)).catch(() => {});
    },
    [key]
  );

  return [value, setValue, loaded];
}
