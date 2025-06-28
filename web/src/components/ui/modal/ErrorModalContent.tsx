import { MouseEventHandler } from "react";

interface ErrorModalContentProps {
  error: string;
  buttonText: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const ErrorModalContent: React.FC<ErrorModalContentProps> = ({
  error,
  buttonText,
  onClick,
}) => {
  return (
    <>
      <p>{error}</p>
      <div className="flex justify-center gap-4">
        <button className="modal-button" onClick={onClick}>
          {buttonText}
        </button>
      </div>
    </>
  );
};

export default ErrorModalContent;
