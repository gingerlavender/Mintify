"use client";

import { useSession } from "next-auth/react";
import BaseButton from "./BaseButton";
import { useAccount } from "wagmi";
import { useMintStatusModal } from "@/app/hooks/useMintStatusModal";
import { memo } from "react";

const MintButton = memo(() => {
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
});

export default MintButton;
