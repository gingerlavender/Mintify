import React, { useEffect, useState } from "react";
import { MintStatus } from "@/types/mint";
import { getMintStatus } from "@/lib/mint";
import { useLoading } from "@/hooks/useLoading";

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
      try {
        startLoading();
        if (!address) {
          throw new Error("Missing wallet address");
        }
        const data = await getMintStatus(address);
        setMessage(messages[data.mintStatus]);
        if (data.mintStatus == "repeated") {
          setPicture(data.tokenURI);
        }
      } catch (error) {
        if (error instanceof Error) {
          setMessage(`Error: ${error.message}`);
        } else {
          setMessage("Unknown error");
        }
        setPicture("/Error.png");
      } finally {
        endLoading();
      }
    })();
  }, []);

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
