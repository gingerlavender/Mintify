import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { parseEther } from "viem";
import { Config, useConfig } from "wagmi";
import { writeContract } from "wagmi/actions";

import { MINTIFY_CONTRACT_ADDRESS } from "@/lib/constants/contracts";

import { useMintArgsStore } from "@/stores/mint-args-store";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

import {
  MintAction,
  MintStep,
  RemintArgsWithSignature,
} from "@/types/nft/mint";

import { useMintActionArguments } from "./useMintActionArguments";
import { useVerifyMintAction } from "./useVerifyMintAction";
import { useWaitForTransactionReceiptMutation } from "./useWaitForTransactionReceiptMutation";

export const useRemintNFT = () => {
  const config = useConfig();

  const getMintActionArguments = useMintActionArguments();
  const remintWithSignature = useRemintWithSignature();
  const waitForTransactionReceipt = useWaitForTransactionReceiptMutation();
  const verifyRemint = useVerifyMintAction();

  const { args: storedArgs, setArgs, resetArgs } = useMintArgsStore();

  const mutation = useMutation({
    mutationFn: async ({
      price,
      chainId,
    }: {
      price: number;
      chainId: number;
    }) => {
      const args = (storedArgs ??
        (await getMintActionArguments.mutateAsync({
          action: MintAction.Remint,
          chainId,
        }))) as RemintArgsWithSignature;
      if (!storedArgs) {
        setArgs(args);
      }

      const hash = await remintWithSignature.mutateAsync({
        config,
        args,
        price,
        chainId,
      });

      await waitForTransactionReceipt.mutateAsync({ config, hash, chainId });

      await verifyRemint.mutateAsync({ txHash: hash, chainId });
    },
    onSuccess: () => resetArgs(),
  });

  const currentStep: MintStep = useMemo(() => {
    if (getMintActionArguments.isPending) return MintStep.Preparing;
    if (remintWithSignature.isPending) return MintStep.Confirming;
    if (waitForTransactionReceipt.isPending) return MintStep.Waiting;
    if (verifyRemint.isPending) return MintStep.Verifying;
    if (mutation.isSuccess) return MintStep.Complete;
    return MintStep.Idle;
  }, [
    getMintActionArguments.isPending,
    remintWithSignature.isPending,
    waitForTransactionReceipt.isPending,
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
