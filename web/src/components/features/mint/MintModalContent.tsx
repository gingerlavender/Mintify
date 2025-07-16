"use client";

import Image from "next/image";
import { BaseError, useChainId } from "wagmi";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "@/lib/api/requests";

import { MintAction, MintStep } from "@/types/nft/mint";
import { NFTStatus, NFTInfo } from "@/types/nft/state";

import { useMintModal } from "@/hooks/modal/useMintModal";
import { useMintAction } from "@/hooks/nft/useMintAction";

const nftStatusMessages: Record<NFTStatus, string> = {
  [NFTStatus.NotMinted]:
    "This is going to be your first mint! Let's sooner find out what you'll get!",
  [NFTStatus.Minted]:
    "You can see yout current NFT below. Remember that you can remint it any time!",
  [NFTStatus.Transferred]:
    "Here is your NFT, but you cannot remint it as it has been transferred.",
};

const mintStepMessages: Record<Exclude<MintStep, MintStep.Idle>, string> = {
  [MintStep.Preparing]: "Generating image and preparing transaction...",
  [MintStep.Confirming]: "Confirming transaction in wallet...",
  [MintStep.Waiting]: "Waiting for blockchain confirmation...",
  [MintStep.Saving]: "Saving information to database...",
  [MintStep.Verifying]: "Verifying your mint...",
  [MintStep.Complete]: "Mint is successful!",
};

const MintModalContent = () => {
  const { closeModal } = useMintModal();

  const chainId = useChainId();

  const queryClient = useQueryClient();

  const {
    data: nftInfo,
    isLoading,
    isError: isFetchError,
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
    mutate: mint,
    isPending,
    isError: isMintError,
    error: mintError,
    currentStep,
  } = useMintAction(mintAction);

  const isError = isFetchError || isMintError;

  const canMint =
    !isError && !!nftStatus && nftStatus !== NFTStatus.Transferred;
  const price = canMint ? nftInfo?.nextPrice : undefined;
  const nftPicture =
    !nftInfo || nftStatus === NFTStatus.NotMinted
      ? "NFTPlaceholder.png"
      : nftInfo.image;

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
      {!isError && nftStatus && <p>{nftStatusMessages[nftStatus]}</p>}
      {price && <p>Your current mint price (without fees): {price} ETH</p>}
      {canMint && isPending ? (
        <p>Please, do not reload page! Be patient, this may take a while...</p>
      ) : (
        <p>
          Please, attend: If you decline transaction, you will be able to try
          again only after an hour.
        </p>
      )}
      <Image
        className="w-[50vw] md:w-[20vw] rounded-2xl"
        src={isError ? "Error.png" : nftPicture}
        alt="NFT Preview"
      />
      {currentStep !== MintStep.Idle && <p>{mintStepMessages[currentStep]}</p>}
      <div className="flex justify-center gap-4">
        <button
          disabled={isPending}
          className="modal-button"
          onClick={canMint ? handleMint : closeModal}
        >
          {canMint
            ? nftStatus === NFTStatus.NotMinted
              ? "Mint"
              : "Remint"
            : "Close"}
        </button>
      </div>
    </>
  );
};

export default MintModalContent;
