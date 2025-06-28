"use client";

import { useAccount } from "wagmi";
import { useModal } from "./useModal";
import MintModalContent from "@/components/ui/modal/MintModalContent";
import { useCallback } from "react";

export const useMintModal = () => {
  const { address } = useAccount();

  const { openModal, closeModal } = useModal();

  const openMintModal = useCallback(() => {
    openModal({
      title: "Your Mint Status",
      content: <MintModalContent address={address} closeModal={closeModal} />,
    });
  }, [address, openModal, closeModal]);

  return { openMintModal };
};
