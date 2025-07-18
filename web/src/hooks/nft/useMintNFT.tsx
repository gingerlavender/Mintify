import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { writeContract } from "wagmi/actions";
import { parseEther, parseEventLogs } from "viem";
import { Config, useConfig } from "wagmi";

import { MINTIFY_CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import { apiRequest } from "@/lib/api/requests";

import { useMintArgsStore } from "@/stores/mint-args-store";

import { MintAction, MintArgsWithSignature, MintStep } from "@/types/nft/mint";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

import { useMintActionArguments } from "./useMintActionArguments";
import { useVerifyMintAction } from "./useVerifyMintAction";
import { useWaitForTransactionReceiptMutation } from "./useWaitForTransactionReceiptMutation";

export const useMintNFT = () => {
  const config = useConfig();

  const getMintActionArguments = useMintActionArguments();
  const mintWithSignature = useSafeMintWithSignature();
  const waitForTransactionReceipt = useWaitForTransactionReceiptMutation();
  const saveToDatabase = useSaveToDatabase();
  const verifyMint = useVerifyMintAction();

  const { args: storedArgs, setArgs, resetArgs } = useMintArgsStore();

  const mutation = useMutation({
    mutationFn: async ({
      price,
      chainId,
    }: {
      price: number;
      chainId: number;
    }) => {
      const args =
        storedArgs ??
        (await getMintActionArguments.mutateAsync({
          action: MintAction.Mint,
          chainId,
        }));
      if (!storedArgs) {
        setArgs(args);
      }

      const hash = await mintWithSignature.mutateAsync({
        config,
        args,
        price,
        chainId,
      });

      const receipt = await waitForTransactionReceipt.mutateAsync({
        config,
        hash,
        chainId,
      });

      const logs = parseEventLogs({
        logs: receipt.logs,
        abi: mintifyAbi,
        eventName: "Minted",
      });
      if (logs.length === 0) {
        throw new Error("Minted event is missing in transaction logs");
      }

      const mintedEvent = logs[0];
      const tokenId = mintedEvent.args._tokenId;

      await saveToDatabase.mutateAsync({ tokenId, chainId });
      await verifyMint.mutateAsync({ txHash: hash, chainId });
    },
    onSuccess: () => resetArgs(),
  });

  const currentStep = useMemo(() => {
    if (getMintActionArguments.isPending) return MintStep.Preparing;
    if (mintWithSignature.isPending) return MintStep.Confirming;
    if (waitForTransactionReceipt.isPending) return MintStep.Waiting;
    if (saveToDatabase.isPending) return MintStep.Saving;
    if (verifyMint.isPending) return MintStep.Verifying;
    if (mutation.isSuccess) return MintStep.Complete;
    return MintStep.Idle;
  }, [
    getMintActionArguments.isPending,
    mintWithSignature.isPending,
    waitForTransactionReceipt.isPending,
    saveToDatabase.isPending,
    verifyMint.isPending,
    mutation.isSuccess,
  ]);

  return { ...mutation, currentStep };
};

const useSafeMintWithSignature = () => {
  return useMutation({
    mutationFn: async ({
      config,
      args,
      price,
      chainId,
    }: {
      config: Config;
      args: MintArgsWithSignature;
      price: number;
      chainId: number;
    }) => {
      return await writeContract(config, {
        address: MINTIFY_CONTRACT_ADDRESS,
        abi: mintifyAbi,
        functionName: "safeMintWithSignature",
        args: [args.tokenURI, args.v, args.r, args.s],
        value: parseEther(price.toString()),
        chainId,
      });
    },
  });
};

const useSaveToDatabase = () => {
  return useMutation({
    mutationFn: async ({
      tokenId,
      chainId,
    }: {
      tokenId: bigint;
      chainId: number;
    }) => {
      const result = await apiRequest(
        "/api/nft/save",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ tokenId: tokenId.toString(), chainId }),
        },
        { logErrors: false }
      );
      if (!result.success)
        throw new Error(`Saving to DB failed: ${result.error}`);
    },
  });
};
