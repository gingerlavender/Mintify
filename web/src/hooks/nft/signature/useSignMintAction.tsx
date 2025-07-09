import { useMutation } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/requests";
import {
  MintAction,
  MintArgsWithSignature,
  RemintArgsWithSignature,
} from "@/types/mint";

export const useSignMintAction = () => {
  const mutation = useMutation({
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
        "api/nft/signature",
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

  const signMint = async (chainId: number): Promise<MintArgsWithSignature> => {
    return (await mutation.mutateAsync({
      chainId,
      action: "mint",
    })) as MintArgsWithSignature;
  };

  const signRemint = async (
    chainId: number
  ): Promise<RemintArgsWithSignature> => {
    return (await mutation.mutateAsync({
      chainId,
      action: "remint",
    })) as RemintArgsWithSignature;
  };

  return { signMint, signRemint };
};
