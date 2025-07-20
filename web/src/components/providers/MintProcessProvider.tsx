"use client";

import { createContext, ReactNode } from "react";
import { useAccount, useChainId } from "wagmi";
import { useQuery } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/requests";

import { useMintAction } from "@/hooks/nft/useMintAction";

import { MintAction, MintStep } from "@/types/nft/mint";
import { NFTStatus, NFTInfo } from "@/types/nft/state";
import { useSession } from "next-auth/react";

interface MintProcessContextType {
  nftPicture: string | undefined;
  nftStatus: NFTStatus | undefined;
  price: number | undefined;
  canMint: boolean;
  currentStep: MintStep;
  fetchIsPending: boolean;
  fetchIsLoading: boolean;
  isFetchError: boolean;
  mintIsPending: boolean;
  mintIsSuccessful: boolean;
  isMintError: boolean;
  isError: boolean;
  fetchError: Error | null;
  mintError: Error | null;
  mint: () => void;
  resetMint: () => void;
  refetchNFTInfo: () => void;
}

export const MintProcessContext = createContext<MintProcessContextType | null>(
  null
);

const MintProcessProvider = ({ children }: { children: ReactNode }) => {
  const { data: session } = useSession();
  const { isConnected, address } = useAccount();

  const chainId = useChainId();

  const {
    data: nftInfo,
    isPending: fetchIsPending,
    isError: isFetchError,
    isLoading: fetchIsLoading,
    error: fetchError,
    refetch: refetchNFTInfo,
  } = useQuery({
    queryKey: ["mintStatus", chainId, address],
    queryFn: async () => {
      if (session?.user.wallet !== address) {
        throw new Error(
          "Wallet address linked to this Spotify account and currently connected wallet address do not match"
        );
      }

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
    retry: 1,
    enabled: !!session && isConnected && !!address && !!session.user.wallet,
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
    nftStatus === NFTStatus.NotMinted ? "/NFTPlaceholder.png" : nftInfo?.image;

  const mint = () => {
    if (price) {
      _mint(
        { price, chainId },
        {
          onSuccess: () => {
            refetchNFTInfo();
            setTimeout(resetMint, 1500);
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
        fetchIsPending,
        fetchIsLoading,
        isFetchError,
        mintIsPending,
        mintIsSuccessful,
        isMintError,
        isError,
        fetchError,
        mintError,
        mint,
        resetMint,
        refetchNFTInfo,
      }}
    >
      {children}
    </MintProcessContext.Provider>
  );
};

export default MintProcessProvider;
