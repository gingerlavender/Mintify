import { MouseEventHandler } from "react";

interface ErrorModalContentProps {
  error: string;
  buttonText: string;
  onClick: MouseEventHandler<HTMLButtonElement>;
}

const ErrorModalContent: React.FC<ErrorModalContentProps> = ({
  error,
  onClick,
}) => {
  return (
    <>
      <p>Error occured: {error}</p>
      <div className="flex justify-center gap-4">
        <button className="modal-button" onClick={onClick}>
          Mint
        </button>
      </div>
    </>
  );
};

export default ErrorModalContent;
