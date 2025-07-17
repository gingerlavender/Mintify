"use client";

import { createContext, ReactNode } from "react";
import { useChainId } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/requests";

import { useMintAction } from "@/hooks/nft/useMintAction";

import { MintAction, MintStep } from "@/types/nft/mint";
import { NFTStatus, NFTInfo } from "@/types/nft/state";

interface MintProcessContextType {
  nftPicture: string;
  nftStatus: NFTStatus | undefined;
  price: number | undefined;
  isFetching: boolean;
  fetchError: Error | null;
  canMint: boolean;
  mintError: Error | null;
  mintIsPending: boolean;
  currentStep: MintStep;
  isError: boolean;
  mint: () => void;
}

export const MintProcessContext = createContext<MintProcessContextType | null>(
  null
);

const MintProcessProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const chainId = useChainId();

  const {
    data: nftInfo,
    isError: isFetchError,
    isLoading: isFetching,
    error: fetchError,
  } = useQuery({
    queryKey: ["mintStatus", chainId],
    queryFn: async () => {
      const result = await apiRequest<NFTInfo>("api/nft/info", {
        headers: { "content-type": "application/json" },
        method: "POST",
        body: JSON.stringify({ chainId }),
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    staleTime: Infinity,
  });

  const nftStatus = nftInfo?.nftStatus;
  const mintAction: MintAction =
    nftStatus === NFTStatus.NotMinted ? MintAction.Mint : MintAction.Remint;

  const {
    mutate,
    isError: isMintError,
    error: mintError,
    currentStep,
  } = useMintAction(mintAction);

  const mintIsPending = currentStep !== MintStep.Idle;
  const isError = isFetchError || isMintError;

  const canMint =
    !isError && !!nftStatus && nftStatus !== NFTStatus.Transferred;
  const price = canMint ? nftInfo?.nextPrice : undefined;
  const nftPicture =
    !nftInfo || nftStatus === NFTStatus.NotMinted
      ? "NFTPlaceholder.png"
      : nftInfo.image;

  const mint = () => {
    if (price) {
      mutate(
        { price, chainId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["mintStatus", chainId],
            });
          },
        }
      );
    }
  };

  return (
    <MintProcessContext.Provider
      value={{
        nftPicture,
        nftStatus,
        price,
        isFetching,
        fetchError,
        canMint,
        mintError,
        mintIsPending,
        currentStep,
        isError,
        mint,
      }}
    >
      {children}
    </MintProcessContext.Provider>
  );
};

export default MintProcessProvider;
