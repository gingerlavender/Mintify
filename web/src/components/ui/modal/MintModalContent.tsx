import React, { useEffect, useState } from "react";
import Image from "next/image";
import { MintStatus, MintStatusResult } from "@/types/mint";
import { useLoading } from "@/hooks/useLoading";
import { apiRequest } from "@/lib/api";
import { useChainId } from "wagmi";

const messages: Record<MintStatus, string> = {
  [MintStatus.NotMinted]:
    "This is going to be your first mint! Let's sooner find out what you'll get!",
  [MintStatus.Minted]:
    "You can see yout current NFT below. Remember that you can remint it any time!",
  [MintStatus.TokenTransferred]:
    "Here is your minted NFT, but you cannot remint anymore as it has been transferred.",
};

interface MintModalContentProps {
  closeModal: () => void;
}

const MintModalContent: React.FC<MintModalContentProps> = ({ closeModal }) => {
  const chainId = useChainId();

  const { isLoading, startLoading, endLoading } = useLoading(true);

  const [message, setMessage] = useState<string | undefined>();
  const [picture, setPicture] = useState<string>("./NFTPlaceholder.png");
  const [price, setPrice] = useState<number | undefined>();
  const [mintIsForbidden, setMintIsForbidden] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      startLoading();

      const result = await apiRequest<MintStatusResult>("api/mint/status", {
        headers: { "content-type": "application/json" },
        method: "POST",
        body: JSON.stringify({ chainId }),
      });

      if (result.success) {
        setMessage(messages[result.data.mintStatus]);

        if (result.data.mintStatus != MintStatus.TokenTransferred) {
          setPrice(result.data.nextPrice);
        } else {
          setMintIsForbidden(true);
        }

        if (
          result.data.mintStatus == MintStatus.Minted ||
          result.data.mintStatus == MintStatus.TokenTransferred
        ) {
          setPicture(result.data.tokenURI);
        }
      } else {
        setMessage(result.error);
        setPicture("./Error.png");
      }

      endLoading();
    })();
  }, [chainId, startLoading, endLoading]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <p>{message}</p>
      {price && <p>Your current mint price (without fees): {price}ETH</p>}
      <Image
        className="w-[50vw] md:w-[20vw] rounded-2xl"
        src={picture}
        alt="NFT Preview"
      />
      <div className="flex justify-center gap-4">
        <button
          disabled={mintIsForbidden}
          className="modal-button"
          onClick={closeModal}
        >
          Mint
        </button>
      </div>
    </>
  );
};

export default MintModalContent;
