"use client";

import { useMutation } from "@tanstack/react-query";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { parseEther, parseEventLogs } from "viem";
import { Config, useConfig } from "wagmi";

import { apiRequest } from "@/lib/api/requests";

import { MintArgsWithSignature } from "@/types/nft/mint";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

import { useSignMintAction } from "../signature/useSignMintAction";
import { MINTIFY_CONTRACT_ADDRESS } from "@/lib/constants/contracts";

export const useMintNFT = () => {
  const config = useConfig();

  const { signMint } = useSignMintAction();
  const mintWithSignature = useSafeMintWithSignature(config);

  const saveToDatabase = useSaveToDatabase();

  return useMutation({
    mutationFn: async ({
      price,
      chainId,
    }: {
      price: number;
      chainId: number;
    }) => {
      const args = await signMint(chainId);

      const hash = await mintWithSignature.mutateAsync({
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
    },
  });
};

const useSafeMintWithSignature = (config: Config) => {
  return useMutation({
    mutationFn: async ({
      args,
      price,
      chainId,
    }: {
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
