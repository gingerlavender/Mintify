import { useCallback, useState } from "react";

export const useLoading = () => {
  const [isLoaded, setIsLoaded] = useState<boolean | undefined>(undefined);

  const startLoading = useCallback(() => setIsLoaded(false), []);
  const endLoading = useCallback(() => setIsLoaded(true), []);

  return { isLoaded, startLoading, endLoading };
};
