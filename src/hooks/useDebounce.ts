import { useEffect, useState } from "react";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const [controller, setController] = useState<AbortController | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    const abortController = new AbortController();
    setController(abortController);

    return () => {
      clearTimeout(handler);
      if (controller) {
        controller.abort();
      }
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
