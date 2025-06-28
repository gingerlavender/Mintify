import { useEffect, useRef } from "react";

export function useOnceWhen(
  effect: () => void | Promise<void>,
  condition: boolean
) {
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (condition && !hasRunRef.current) {
      hasRunRef.current = true;
      void effect();
    }
  }, [condition, effect]);
}
