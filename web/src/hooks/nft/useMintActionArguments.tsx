import { useMutation } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/requests";
import {
  MintAction,
  MintArgsWithSignature,
  RemintArgsWithSignature,
} from "@/types/nft/mint";

export const useMintActionArguments = () => {
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
        "api/nft/mint-arguments",
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

  const getMintArguments = async (
    chainId: number
  ): Promise<MintArgsWithSignature> => {
    return (await mutation.mutateAsync({
      chainId,
      action: MintAction.Mint,
    })) as MintArgsWithSignature;
  };

  const getRemintArguments = async (
    chainId: number
  ): Promise<RemintArgsWithSignature> => {
    return (await mutation.mutateAsync({
      chainId,
      action: MintAction.Remint,
    })) as RemintArgsWithSignature;
  };

  return { getMintArguments, getRemintArguments };
};
