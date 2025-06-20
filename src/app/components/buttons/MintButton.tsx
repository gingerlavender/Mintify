"use client";

import { useSession } from "next-auth/react";
import BaseButton from "./BaseButton";
import { useAccount } from "wagmi";
import { useState } from "react";

const MintButton = () => {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const [message, setMessage] = useState<string>("");

  const handleCheckMintStatus = async () => {
    try {
      const resp = await fetch("api/verify/checkMintStatus", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ walletAddress: address }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error);
      }
      setMessage(data.status);
      console.log(data.status);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
        console.log(error.message);
      } else {
        setMessage("Unknown error");
      }
    }
  };

  return (
    <BaseButton
      disabled={!isConnected || !session}
      text="Let's go!"
      onClick={handleCheckMintStatus}
    />
  );
};

export default MintButton;
