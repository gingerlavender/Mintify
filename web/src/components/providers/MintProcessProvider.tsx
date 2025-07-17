"use client";

import { createContext, ReactNode } from "react";
import { useAccount, useChainId } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/requests";

import { useMintAction } from "@/hooks/nft/useMintAction";

import { MintAction, MintStep } from "@/types/nft/mint";
import { NFTStatus, NFTInfo } from "@/types/nft/state";
import { useSession } from "next-auth/react";

interface MintProcessContextType {
  nftPicture: string;
  nftStatus: NFTStatus | undefined;
  price: number | undefined;
  canMint: boolean;
  currentStep: MintStep;
  isFetching: boolean;
  isFetchError: boolean;
  mintIsPending: boolean;
  mintIsSuccessful: boolean;
  isMintError: boolean;
  isError: boolean;
  fetchError: Error | null;
  mintError: Error | null;
  mint: () => void;
}

export const MintProcessContext = createContext<MintProcessContextType | null>(
  null
);

const MintProcessProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = useQueryClient();

  const { data: session } = useSession();
  const { isConnected, address } = useAccount();

  const chainId = useChainId();

  const {
    data: nftInfo,
    isError: isFetchError,
    isLoading: isFetching,
    error: fetchError,
  } = useQuery({
    queryKey: ["mintStatus", chainId, address],
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
    retry: 3,
    enabled: !!session && isConnected && !!address,
  });

  const nftStatus = nftInfo?.nftStatus;
  const mintAction: MintAction =
    nftStatus === NFTStatus.NotMinted ? MintAction.Mint : MintAction.Remint;

  const {
    mutate: _mint,
    reset: resetMint,
    isError: isMintError,
    error: mintError,
    isPending: mintIsPending,
    isSuccess: mintIsSuccessful,
    currentStep,
  } = useMintAction(mintAction);

  const isError = isFetchError || isMintError;

  const canMint =
    !isFetchError && !!nftStatus && nftStatus !== NFTStatus.Transferred;
  const price = canMint ? nftInfo?.nextPrice : undefined;
  const nftPicture =
    !nftInfo || nftStatus === NFTStatus.NotMinted
      ? "NFTPlaceholder.png"
      : nftInfo.image;

  const mint = () => {
    if (price) {
      _mint(
        { price, chainId },
        {
          onSuccess: () => {
            setTimeout(resetMint, 1000);
            queryClient.invalidateQueries({
              queryKey: ["mintStatus", chainId],
            });
          },
          onError: (error) => console.error(error),
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
        canMint,
        currentStep,
        isFetching,
        isFetchError,
        mintIsPending,
        mintIsSuccessful,
        isMintError,
        isError,
        fetchError,
        mintError,
        mint,
      }}
    >
      {children}
    </MintProcessContext.Provider>
  );
};

export default MintProcessProvider;
