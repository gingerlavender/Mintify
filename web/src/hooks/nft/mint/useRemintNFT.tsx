import { useMutation } from "@tanstack/react-query";
import { parseEther } from "viem";
import { Config, useConfig } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";

import { MINTIFY_CONTRACT_ADDRESS } from "@/lib/constants/contracts";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

import { RemintArgsWithSignature } from "@/types/nft/mint";

import { useSignMintAction } from "../signature/useSignMintAction";

export const useRemintNFT = () => {
  const config = useConfig();

  const { signRemint } = useSignMintAction();
  const remintWithSignature = useRemintWithSignature(config);

  return useMutation({
    mutationFn: async ({
      price,
      chainId,
    }: {
      price: number;
      chainId: number;
    }) => {
      const args = await signRemint(chainId);

      const hash = await remintWithSignature.mutateAsync({
        args,
        price,
        chainId,
      });

      const receipt = await waitForTransactionReceipt(config, {
        hash,
        chainId,
      });
      if (receipt.status === "reverted") {
        throw new Error("Transaction was reverted");
      }
    },
  });
};

const useRemintWithSignature = (config: Config) => {
  return useMutation({
    mutationFn: async ({
      args,
      price,
      chainId,
    }: {
      args: RemintArgsWithSignature;
      price: number;
      chainId: number;
    }) => {
      return await writeContract(config, {
        address: MINTIFY_CONTRACT_ADDRESS,
        abi: mintifyAbi,
        functionName: "updateTokenURIWithSignature",
        args: [
          BigInt(args.tokenId),
          args.tokenURI,
          Number(args.v),
          args.r,
          args.s,
        ],
        value: parseEther(price.toString()),
        chainId,
      });
    },
  });
};
