import { useSession } from "next-auth/react";
import BaseButton from "./BaseButton";
import { useAccount } from "wagmi";
import React from "react";

const MintButton = () => {
  const { data: session } = useSession();
  const { isConnected } = useAccount();

  return <BaseButton disabled={!isConnected || !session} text="Let's go!" />;
};

export default MintButton;
