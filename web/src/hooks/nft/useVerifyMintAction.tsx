import { useMutation } from "@tanstack/react-query";
import { Hash } from "viem";

import { apiRequest } from "@/lib/api/requests";

export const useVerifyMintAction = () => {
  return useMutation({
    mutationFn: async ({
      txHash,
      chainId,
    }: {
      txHash: Hash;
      chainId: number;
    }) => {
      const result = await apiRequest(
        "api/nft/mint/verify",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ txHash, chainId }),
        },
        { logErrors: false }
      );
      if (!result.success) {
        throw new Error(result.error);
      }
    },
  });
};
