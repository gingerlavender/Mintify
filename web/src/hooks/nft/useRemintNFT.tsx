import { useMutation } from "@tanstack/react-query";
import { parseEther } from "viem";
import { Config, useConfig } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";

import { MINTIFY_CONTRACT_ADDRESS } from "@/lib/constants/contracts";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

import { RemintArgsWithSignature } from "@/types/nft/mint";

import { useMintActionArguments } from "./useMintActionArguments";
import { useVerifyMintAction } from "./useVerifyMintAction";

export const useRemintNFT = () => {
  const config = useConfig();

  const { getRemintArguments } = useMintActionArguments();

  const remintWithSignature = useRemintWithSignature();
  const verifyRemint = useVerifyMintAction();

  return useMutation({
    mutationFn: async ({
      price,
      chainId,
    }: {
      price: number;
      chainId: number;
    }) => {
      const args = await getRemintArguments(chainId);

      const hash = await remintWithSignature.mutateAsync({
        config,
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

      await verifyRemint.mutateAsync({ txHash: hash, chainId });
    },
  });
};

const useRemintWithSignature = () => {
  return useMutation({
    mutationFn: async ({
      config,
      args,
      price,
      chainId,
    }: {
      config: Config;
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
