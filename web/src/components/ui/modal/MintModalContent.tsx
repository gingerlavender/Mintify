import React, { useEffect, useState } from "react";
import { MintStatus, MintStatusResult } from "@/types/mint";
import { useLoading } from "@/hooks/useLoading";
import { apiRequest } from "@/lib/api";
import { useAccount, useChainId } from "wagmi";

const messages: Record<MintStatus, string> = {
  first:
    "This is going to be your first mint! Let's sooner find out what you'll get!",
  repeated:
    "You can see yout current NFT below. Remember that you can remint it any time!",
  transferred:
    "Here is your minted NFT, but you cannot remint anymore as it has been transferred.",
};

interface MintModalContentProps {
  closeModal: () => void;
}

const MintModalContent: React.FC<MintModalContentProps> = ({ closeModal }) => {
  const { address } = useAccount();
  const chainId = useChainId();

  const { isLoading, startLoading, endLoading } = useLoading(true);

  const [message, setMessage] = useState<string>("");
  const [picture, setPicture] = useState<string>("/NFTPlaceholder.png");

  useEffect(() => {
    (async () => {
      startLoading();

      if (!address) {
        setMessage("Missing wallet address");
        setPicture("./Error.png");
        endLoading();
        return;
      }

      const result = await apiRequest<MintStatusResult>("api/mint/status", {
        headers: { "content-type": "application/json" },
        method: "POST",
        body: JSON.stringify({ walletAddress: address, chainId }),
      });

      if (result.success) {
        setMessage(messages[result.data.mintStatus]);
        if (result.data.mintStatus == "repeated") {
          setPicture(result.data.tokenURI);
        }
      } else {
        setMessage(result.error);
        setPicture("./Error.png");
      }

      endLoading();
    })();
  }, [address, chainId, startLoading, endLoading]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <p>{message}</p>
      <img
        className="w-[50vw] md:w-[20vw] rounded-2xl"
        src={picture}
        alt="NFT Preview"
      />
      <div className="flex justify-center gap-4">
        <button className="modal-button" onClick={closeModal}>
          Mint
        </button>
      </div>
    </>
  );
};

export default MintModalContent;
