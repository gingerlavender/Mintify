"use client";

import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";

import Button from "@/components/ui/buttons/Button";
import { useMintModal } from "@/hooks/modal/useMintModal";

const MintButton = () => {
  const { data: session } = useSession();
  const { isConnected } = useAccount();

  const { openModal } = useMintModal();

  return (
    <Button
      disabled={!session || !isConnected}
      text="Let's go!"
      onClick={openModal}
    />
  );
};

export default MintButton;
