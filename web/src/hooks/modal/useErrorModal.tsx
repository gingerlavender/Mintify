import ErrorModalContent from "@/components/ui/modal/ErrorModalContent";
import { useModal } from "./useModal";

interface ErrorModalOptions {
  message: string;
  buttonText?: string;
  onClick?: () => void;
}

export const useErrorModal = () => {
  const { openModal, closeModal } = useModal();

  const openErrorModal = ({
    message,
    buttonText = "close",
    onClick = closeModal,
  }: ErrorModalOptions) => {
    openModal({
      title: "Error",
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

  return { openErrorModal, closeErrorModal: closeModal };
};
