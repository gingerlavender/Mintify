import { useMutation } from "@tanstack/react-query";
import { Hash } from "viem";
import { Config } from "wagmi";
import { waitForTransactionReceipt } from "wagmi/actions";

export const useWaitForTransactionReceiptMutation = () => {
  return useMutation({
    mutationFn: async ({
      config,
      hash,
      chainId,
    }: {
      config: Config;
      hash: Hash;
      chainId: number;
    }) => {
      const receipt = await waitForTransactionReceipt(config, {
        hash,
        chainId,
      });
      if (receipt.status === "reverted") {
        throw new Error("Transaction was reverted");
      }
      return receipt;
    },
  });
};
