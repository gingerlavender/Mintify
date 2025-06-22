"use client";

import { useSession } from "next-auth/react";
import BaseButton from "./BaseButton";
import { useAccount } from "wagmi";
import { useState } from "react";
import { MintStatus, MintStatusResponse } from "@/app/types/mint.types";
import { useMintStatusModal } from "@/app/hooks/useMintStatusModal";

const MintButton = () => {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const [mintStatus, setMintStatus] = useState<MintStatus>();
  const [message, setMessage] = useState<string>("");

  const { MintStatusModal, open } = useMintStatusModal(message);

  const messages: Record<MintStatus, string> = {
    first:
      "This will be your first mint! Let's sooner find out what you'll get!",
    repeated:
      "You can see yout current NFT below. Remember You can remint it any time!",
  };

  const handleCheckMintStatus = async () => {
    try {
      const resp = await fetch("api/mint/status", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await resp.json();
      setMintStatus(data.mintStatus);
      setMessage(
        data.success == "true"
          ? messages[data.mintStatus as MintStatus]
          : `Error: ${data.error}`
      );
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Unknown error");
      }
    } finally {
      open();
    }
  };

  return (
    <>
      <BaseButton
        disabled={!session || !isConnected}
        text="Let's go!"
        onClick={handleCheckMintStatus}
      />
      <MintStatusModal message={message} />
    </>
  );
};

export default MintButton;
