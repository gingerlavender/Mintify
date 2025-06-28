import { useCallback, useState } from "react";

export const useLoading = (initial: boolean) => {
  const [isLoading, setIsLoading] = useState<boolean>(initial);

  const startLoading = useCallback(() => setIsLoading(false), []);
  const endLoading = useCallback(() => setIsLoading(true), []);

  return { isLoading, startLoading, endLoading };
};
