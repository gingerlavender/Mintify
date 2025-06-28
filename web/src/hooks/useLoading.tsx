import { useCallback, useState } from "react";

export const useLoading = (initial: boolean) => {
  const [isLoading, setIsLoaded] = useState<boolean>(initial);

  const startLoading = useCallback(() => setIsLoaded(false), []);
  const endLoading = useCallback(() => setIsLoaded(true), []);

  return { isLoading, startLoading, endLoading };
};
