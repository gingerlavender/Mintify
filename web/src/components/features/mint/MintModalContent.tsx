"use client";

import Image from "next/image";
import { BaseError } from "wagmi";

import { useMintModal } from "@/hooks/modal/useMintModal";

import { useMintProcess } from "@/hooks/nft/useMintProcess";

import { MintStep } from "@/types/nft/mint";
import { NFTStatus } from "@/types/nft/state";

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
  const {
    nftPicture,
    nftStatus,
    price,
    fetchIsPending,
    fetchIsLoading,
    fetchError,
    canMint,
    mintError,
    mintIsPending,
    mintIsSuccessful,
    isMintError,
    currentStep,
    isError,
    mint,
    resetMint,
    refetchNFTInfo,
  } = useMintProcess();

  const { closeModal } = useMintModal();

  const dismissMintError = () => {
    refetchNFTInfo();
    resetMint();
  };

  const imageSrc = isError ? "/Error.png" : nftPicture;

  if (fetchIsLoading) {
    return <p>Loading...</p>;
  }
  if (fetchIsPending) {
    return <p>NFT Info fetch is pending...</p>;
  }

  return (
    <>
      {mintError && (
        <p>
          {`Mint error: ${
            (mintError as BaseError).shortMessage || mintError.message
          }`}
        </p>
      )}
      {fetchError && <p>Fetch error: {fetchError.message}</p>}
      {!isError && nftStatus && <p>{nftStatusMessages[nftStatus]}</p>}
      {price && <p>Your current mint price (without fees): {price} ETH</p>}
      {mintIsPending && <p>Please, be patient! This may take a while...</p>}
      {imageSrc && (
        <Image
          width={1024}
          height={1024}
          className="w-[50vw] md:w-[20vw] rounded-2xl"
          src={imageSrc}
          alt="NFT Preview"
        />
      )}
      {currentStep !== MintStep.Idle && <p>{mintStepMessages[currentStep]}</p>}
      <div className="flex justify-center gap-4">
        <button
          disabled={mintIsPending || mintIsSuccessful}
          className="modal-button"
          onClick={
            canMint ? (isMintError ? dismissMintError : mint) : closeModal
          }
        >
          {canMint
            ? isMintError
              ? "Dismiss"
              : nftStatus === NFTStatus.NotMinted
                ? "Mint"
                : "Remint"
            : "Close"}
        </button>
      </div>
    </>
  );
};

export default MintModalContent;
