import { useMutation } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/requests";
import {
  MintAction,
  MintArgsWithSignature,
  RemintArgsWithSignature,
} from "@/types/nft/mint";

export const useMintActionArguments = () => {
  return useMutation({
    mutationFn: async ({
      chainId,
      action,
    }: {
      chainId: number;
      readonly action: MintAction;
    }) => {
      const result = await apiRequest<
        MintArgsWithSignature | RemintArgsWithSignature
      >(
        "api/nft/mint/arguments",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ action, chainId }),
        },
        { logErrors: false }
      );

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
  });
};
