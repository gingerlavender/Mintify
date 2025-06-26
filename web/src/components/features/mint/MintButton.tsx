"use client";

import { useSession } from "next-auth/react";
import BaseButton from "@/components/ui/buttons/BaseButton";
import { useAccount } from "wagmi";
import { useMintStatusModal } from "@/hooks/useMintStatusModal";

const MintButton = () => {
  const { data: session } = useSession();
  const { isConnected } = useAccount();

  const { MintStatusModal, openMintStatusModal } = useMintStatusModal();

  return (
    <>
      <BaseButton
        disabled={!session || !isConnected}
        text="Let's go!"
        onClick={openMintStatusModal}
      />
      <MintStatusModal />
    </>
  );
};

export default MintButton;
