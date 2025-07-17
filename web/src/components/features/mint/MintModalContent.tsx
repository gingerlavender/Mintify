"use client";

import Image from "next/image";
import { BaseError } from "wagmi";

import { useMintModal } from "@/hooks/modal/useMintModal";

import { MintStep } from "@/types/nft/mint";
import { NFTStatus } from "@/types/nft/state";
import { useMintProcess } from "@/hooks/nft/useMintProcess";

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
    isFetching,
    fetchError,
    canMint,
    mintError,
    mintIsPending,
    currentStep,
    isError,
    mint,
  } = useMintProcess();

  const { closeModal } = useMintModal();

  if (isFetching) {
    return <p>Loading...</p>;
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
      {canMint &&
        (mintIsPending ? (
          <p>Please, be patient! This may take a while...</p>
        ) : (
          <p>
            Please, attend: If you decline transaction, you will be able to try
            again only after an hour.
          </p>
        ))}
      <Image
        className="w-[50vw] md:w-[20vw] rounded-2xl"
        src={isError ? "Error.png" : nftPicture}
        alt="NFT Preview"
      />
      {currentStep !== MintStep.Idle && <p>{mintStepMessages[currentStep]}</p>}
      <div className="flex justify-center gap-4">
        <button
          disabled={mintIsPending}
          className="modal-button"
          onClick={canMint ? mint : closeModal}
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
