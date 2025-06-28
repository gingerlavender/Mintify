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

const MintModalContent = ({
  address,
  closeModal,
}: {
  address: string | undefined;
  closeModal: () => void;
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
        <button
          className="bg-white/100 rounded-xl p-3 md:min-w-[10vw] min-w-[30vw] font-[400] hover:scale-[103%] hover:bg-white/60 cursor-pointer transition-all duration-200 shadow-xs"
          onClick={closeModal}
        >
          Mint
        </button>
      </div>
    </>
  );
};

export default MintModalContent;
