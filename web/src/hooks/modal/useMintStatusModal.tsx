"use client";

import { useAccount } from "wagmi";
import { useModal } from "./useModal";
import MintStatusModalContent from "@/components/ui/modal/MintStatusModalContent";

export const useMintStatusModal = () => {
  const { address } = useAccount();

  const { openModal, closeModal } = useModal();

  const openMintStatusModal = () => {
    openModal({
      title: "Your Mint Status",
      content: (
        <MintStatusModalContent address={address} closeModal={closeModal} />
      ),
    });
  };

  return { openMintStatusModal };
};
