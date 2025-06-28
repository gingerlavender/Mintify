"use client";

import ErrorModalContent from "@/components/ui/modal/ErrorModalContent";
import { useModal } from "./useModal";
import { useCallback } from "react";

interface ErrorModalOptions {
  message: string;
  buttonText?: string;
  onClick?: () => void;
}

export const useErrorModal = () => {
  const { openModal, closeModal } = useModal();

  const openErrorModal = useCallback(
    ({
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
    },
    [openModal, closeModal]
  );

  return { openErrorModal, closeErrorModal: closeModal };
};
