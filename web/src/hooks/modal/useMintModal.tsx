"use client";

import { useAccount } from "wagmi";
import { useModal } from "./useModal";
import MintModalContent from "@/components/ui/modal/MintModalContent";

export const useMintModal = () => {
  const { address } = useAccount();

  const { openModal, closeModal } = useModal();

  const openMintModal = () => {
    openModal({
      title: "Your Mint Status",
      content: <MintModalContent address={address} closeModal={closeModal} />,
    });
  };

  return { openMintModal };
};
