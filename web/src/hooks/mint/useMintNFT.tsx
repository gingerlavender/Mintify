"use client";

import { useMutation } from "@tanstack/react-query";
import { waitForTransactionReceipt, writeContract } from "wagmi/actions";
import { isAddress, parseEther, parseEventLogs } from "viem";
import { BaseError, Config, useConfig } from "wagmi";

import { apiRequest } from "@/lib/api/requests";

import { MintArgsWithSignature } from "@/types/mint";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

export const useMintNFT = () => {
  const config = useConfig();

  const signMintMessage = useSignMintMessage();
  const safeMintWithSignature = useSafeMintWithSignature(config);
  const saveToDatabase = useSaveToDatabase();

  return useMutation({
    mutationFn: async ({
      price,
      chainId,
    }: {
      price: number;
      chainId: number;
    }) => {
      const args = await signMintMessage.mutateAsync({ chainId });

      const hash = await safeMintWithSignature.mutateAsync({
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

const useSignMintMessage = () => {
  return useMutation({
    mutationFn: async ({ chainId }: { chainId: number }) => {
      const result = await apiRequest<MintArgsWithSignature>("api/mint", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type: "mint", chainId }),
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
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
      const mintifyAddress = process.env.NEXT_PUBLIC_MINTIFY_ADDRESS;
      if (!mintifyAddress || !isAddress(mintifyAddress)) {
        throw new Error("Missing or incorrect contract address");
      }

      try {
        return await writeContract(config, {
          address: mintifyAddress,
          abi: mintifyAbi,
          functionName: "safeMintWithSignature",
          args: [args.tokenURI, Number(args.v), args.r, args.s],
          value: parseEther(price.toString()),
          chainId,
        });
      } catch (error) {
        throw new Error(
          (error as BaseError).shortMessage || "Unknown on-chain error"
        );
      }
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
      const result = await apiRequest("/api/mint/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tokenId: tokenId.toString(), chainId }),
      });
      if (!result.success)
        throw new Error(`Saving to DB failed: ${result.error}`);
    },
  });
};
