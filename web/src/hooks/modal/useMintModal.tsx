"use client";

import { useModal } from "./useModal";
import MintModalContent from "@/components/ui/modal/MintModalContent";

export const useMintModal = () => {
  const { openModal, closeModal } = useModal();

  const openMintModal = () => {
    openModal({
      title: "Your Mint Status",
      content: <MintModalContent closeModal={closeModal} />,
    });
  };

  return { openMintModal };
};
