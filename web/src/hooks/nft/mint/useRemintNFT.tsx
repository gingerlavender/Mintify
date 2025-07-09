import { useMutation } from "@tanstack/react-query";
import { isAddress, parseEther } from "viem";
import { Config, useConfig } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";

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
      const mintifyAddress = process.env.NEXT_PUBLIC_MINTIFY_ADDRESS;
      if (!mintifyAddress || !isAddress(mintifyAddress)) {
        throw new Error("Missing or incorrect contract address");
      }

      return await writeContract(config, {
        address: mintifyAddress,
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
