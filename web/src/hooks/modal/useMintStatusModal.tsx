"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { MintStatus } from "@/types/mint";
import { getMintStatus } from "@/lib/mint";
import { useModal } from "./useModal";

const messages: Record<MintStatus, string> = {
  first:
    "This is going to be your first mint! Let's sooner find out what you'll get!",
  repeated:
    "You can see yout current NFT below. Remember you can remint it any time!",
};

export const useMintStatusModal = () => {
  const [message, setMessage] = useState<string>("");
  const [picture, setPicture] = useState<string>("/NFTPlaceholder.png");

  const { address } = useAccount();

  const { openModal, closeModal, endLoading } = useModal();

  const openMintStatusModal = async () => {
    openModal({
      title: "Your Mint Status",
      loading: true,
      content: (
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
      ),
    });

    try {
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
  };

  return { openMintStatusModal };
};
