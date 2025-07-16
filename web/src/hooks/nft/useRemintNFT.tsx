"use client";

import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { parseEther } from "viem";
import { Config, useChainId, useConfig } from "wagmi";
import { writeContract, waitForTransactionReceipt } from "wagmi/actions";

import { MINTIFY_CONTRACT_ADDRESS } from "@/lib/constants/contracts";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

import {
  MintAction,
  MintStep,
  RemintArgsWithSignature,
} from "@/types/nft/mint";

import { useMintActionArguments } from "./useMintActionArguments";
import { useVerifyMintAction } from "./useVerifyMintAction";

export const useRemintNFT = () => {
  const config = useConfig();
  const chainId = useChainId();

  const getMintActionArguments = useMintActionArguments();
  const remintWithSignature = useRemintWithSignature();
  const verifyRemint = useVerifyMintAction();

  const mutation = useMutation({
    mutationKey: ["remint", chainId],
    mutationFn: async ({
      price,
      chainId,
    }: {
      price: number;
      chainId: number;
    }) => {
      const args = (await getMintActionArguments.mutateAsync({
        action: MintAction.Remint,
        chainId,
      })) as RemintArgsWithSignature;

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
    onError: (error) => console.error(error),
  });

  const currentStep: MintStep = useMemo(() => {
    if (getMintActionArguments.isPending) return MintStep.Preparing;
    if (remintWithSignature.isPending) return MintStep.Confirming;
    if (remintWithSignature.isSuccess && verifyRemint.isIdle)
      return MintStep.Waiting;
    if (verifyRemint.isPending) return MintStep.Verifying;
    if (mutation.isSuccess) return MintStep.Complete;
    return MintStep.Idle;
  }, [
    getMintActionArguments.isPending,
    remintWithSignature.isPending,
    remintWithSignature.isSuccess,
    verifyRemint.isIdle,
    verifyRemint.isPending,
    mutation.isSuccess,
  ]);

  return { ...mutation, currentStep };
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
