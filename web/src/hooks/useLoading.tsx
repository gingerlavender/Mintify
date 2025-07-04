"use client";

import { useCallback, useState } from "react";

export const useLoading = (initial: boolean) => {
  const [isLoading, setIsLoading] = useState<boolean>(initial);

  const startLoading = useCallback(() => setIsLoading(true), []);
  const endLoading = useCallback(() => setIsLoading(false), []);

  return { isLoading, startLoading, endLoading };
};
