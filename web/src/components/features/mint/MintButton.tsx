"use client";

import { useSession } from "next-auth/react";
import BaseButton from "@/components/ui/buttons/BaseButton";
import { useAccount } from "wagmi";
import { useMintStatusModal } from "@/hooks/modal/useMintStatusModal";

const MintButton = () => {
  const { data: session } = useSession();
  const { isConnected } = useAccount();

  const { openMintStatusModal } = useMintStatusModal();

  return (
    <>
      <BaseButton
        disabled={!session || !isConnected}
        text="Let's go!"
        onClick={openMintStatusModal}
      />
    </>
  );
};

export default MintButton;
