"use client";

import { useSession } from "next-auth/react";
import BaseButton from "@/components/ui/buttons/BaseButton";
import { useAccount } from "wagmi";
import { useMintModal } from "@/hooks/modal/useMintModal";

const MintButton = () => {
  const { data: session } = useSession();
  const { isConnected } = useAccount();

  const { openMintModal } = useMintModal();

  return (
    <>
      <BaseButton
        disabled={!session || !isConnected}
        text="Let's go!"
        onClick={openMintModal}
      />
    </>
  );
};

export default MintButton;
