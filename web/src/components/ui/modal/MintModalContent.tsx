import React, { useEffect, useState } from "react";
import { MintStatus, MintStatusResult } from "@/types/mint";
import { useLoading } from "@/hooks/useLoading";
import { apiRequest } from "@/lib/api";

const messages: Record<MintStatus, string> = {
  first:
    "This is going to be your first mint! Let's sooner find out what you'll get!",
  repeated:
    "You can see yout current NFT below. Remember you can remint it any time!",
};

interface MintModalContentProps {
  address: string | undefined;
  closeModal: () => void;
}

const MintModalContent: React.FC<MintModalContentProps> = ({
  address,
  closeModal,
}) => {
  const { isLoaded, startLoading, endLoading } = useLoading();

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
        body: JSON.stringify({ walletAddress: address }),
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
  }, [address, startLoading, endLoading]);

  if (!isLoaded) {
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
