"use client";

import { useModal } from "./useModal";
import MintModalContent from "@/components/features/mint/MintModalContent";

export const useMintModal = () => {
  const { openModal, closeModal } = useModal();

  const openMintModal = () => {
    openModal({
      title: "Your Mint Status",
      content: <MintModalContent />,
    });
  };

  return { openMintModal, closeMintModal: closeModal };
};
