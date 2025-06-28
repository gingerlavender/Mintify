import { useState } from "react";

export const useLoading = () => {
  const [isLoaded, setIsLoaded] = useState<boolean | undefined>(undefined);

  const startLoading = () => setIsLoaded(false);
  const endLoading = () => setIsLoaded(true);

  return { isLoaded, startLoading, endLoading };
};
