"use client";

import Image from "next/image";
import { useChainId } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/requests";

import { MintStatus, MintStatusInfo } from "@/types/mint";

import { useMintNFT } from "@/hooks/mint/useMintNFT";
import { useMintModal } from "@/hooks/modal/useMintModal";

const messages: Record<MintStatus, string> = {
  not_minted:
    "This is going to be your first mint! Let's sooner find out what you'll get!",
  minted:
    "You can see yout current NFT below. Remember that you can remint it any time!",
  token_transferred:
    "Here is your minted NFT, but you cannot remint anymore as it has been transferred.",
};

const MintModalContent = () => {
  const { closeMintModal } = useMintModal();

  const chainId = useChainId();

  const queryClient = useQueryClient();

  const {
    mutate: mint,
    isPending,
    isError: isMintError,
    error: mintError,
  } = useMintNFT();

  const {
    data: mintStatusInfo,
    isLoading,
    isError: isFetchError,
    error: fetchError,
  } = useQuery({
    queryKey: ["mintStatus", chainId],
    queryFn: async () => {
      const result = await apiRequest<MintStatusInfo>("api/mint/status", {
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

  const isError = isFetchError || isMintError;

  const mintStatus = mintStatusInfo?.mintStatus;

  const canMint = mintStatus !== "token_transferred";
  const price = canMint ? mintStatusInfo?.nextPrice : undefined;
  const nftPicture =
    !mintStatusInfo || mintStatus === "not_minted"
      ? "NFTPlaceholder.png"
      : mintStatusInfo.tokenURI;

  const handleMint = ({
    price,
    chainId,
  }: {
    price: number;
    chainId: number;
  }) => {
    return () =>
      mint(
        { price, chainId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["mintStatus", chainId],
            });
          },
        }
      );
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {isMintError && <p>Mint error: {mintError.message}</p>}
      {isFetchError && <p>Fetch error: {fetchError.message}</p>}
      {!isError && mintStatus && <p>{messages[mintStatus]}</p>}
      {!isError && price && (
        <p>Your current mint price (without fees): {price} ETH</p>
      )}
      <Image
        className="w-[50vw] md:w-[20vw] rounded-2xl"
        src={isError ? "Error.png" : nftPicture}
        alt="NFT Preview"
      />
      <div className="flex justify-center gap-4">
        {canMint && price && (
          <button
            disabled={isPending}
            className="modal-button"
            onClick={isError ? closeMintModal : handleMint({ price, chainId })}
          >
            {isPending ? "Pending..." : isError ? "Close" : "Mint"}
          </button>
        )}
      </div>
    </>
  );
};

export default MintModalContent;
