"use client";

import Image from "next/image";
import { BaseError, useChainId } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/requests";

import { MintAction, MintStatus, MintStatusInfo } from "@/types/mint";

import { useMintModal } from "@/hooks/modal/useMintModal";
import { useMintAction } from "@/hooks/nft/mint/useMintAction";

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
    data: mintStatusInfo,
    isLoading,
    isError: isFetchError,
    error: fetchError,
  } = useQuery({
    queryKey: ["mintStatus", chainId],
    queryFn: async () => {
      const result = await apiRequest<MintStatusInfo>("api/nft/status", {
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

  const mintStatus = mintStatusInfo?.mintStatus;
  const mintAction: MintAction =
    mintStatus === "not_minted" ? "mint" : "remint";

  const {
    mutate: mint,
    isPending,
    isError: isMintError,
    error: mintError,
  } = useMintAction(mintAction);

  const isError = isFetchError || isMintError;

  const canMint =
    !isError && !!mintStatus && mintStatus !== "token_transferred";
  const price = canMint ? mintStatusInfo?.nextPrice : undefined;
  const nftPicture =
    !mintStatusInfo || mintStatus === "not_minted"
      ? "NFTPlaceholder.png"
      : mintStatusInfo.image;

  const handleMint = () => {
    if (price) {
      mint(
        { price, chainId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["mintStatus", chainId],
            });
          },
          onError: (error) => console.error(error),
        }
      );
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {isMintError && (
        <p>
          {`Mint error: ${
            (mintError as BaseError).shortMessage || mintError.message
          }`}
        </p>
      )}
      {isFetchError && <p>Fetch error: {fetchError.message}</p>}
      {!isError && mintStatus && <p>{messages[mintStatus]}</p>}
      {price && <p>Your current mint price (without fees): {price} ETH</p>}
      <Image
        className="w-[50vw] md:w-[20vw] rounded-2xl"
        src={isError ? "Error.png" : nftPicture}
        alt="NFT Preview"
      />
      <div className="flex justify-center gap-4">
        <button
          disabled={isPending}
          className="modal-button"
          onClick={canMint ? handleMint : closeMintModal}
        >
          {isPending ? "Pending..." : canMint ? "Mint" : "Close"}
        </button>
      </div>
    </>
  );
};

export default MintModalContent;
