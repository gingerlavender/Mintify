"use client";

import ErrorModalContent from "@/components/ui/modal/ErrorModalContent";
import { useModal } from "./useModal";

interface ErrorModalOptions {
  message: string;
  buttonText?: string;
  onClick?: () => void;
}

export const useErrorModal = () => {
  const { openModal, closeModal, enableClose, disableClose } = useModal();

  const openErrorModal = ({
    message,
    buttonText = "Close",
    onClick = closeModal,
  }: ErrorModalOptions) => {
    openModal({
      title: "Error :(",
      disableClose: true,
      content: (
        <ErrorModalContent
          error={message}
          buttonText={buttonText}
          onClick={onClick}
        />
      ),
    });
  };

  return { openModal: openErrorModal, closeModal, enableClose, disableClose };
};
