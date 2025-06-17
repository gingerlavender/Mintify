import React from "react";
import { ButtonWithAvatarProps } from "@/app/types/button.types";

const ButtonWithAvatar: React.FC<ButtonWithAvatarProps> = ({
  text,
  textOnConnected,
  onClick,
  connected,
  avatar,
  disabled,
}) => {
  return (
    <button
      type="button"
      className={`task-button flex justify-around ${
        connected ? "min-w-fit" : "w-full"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {!connected ? (
        `${text}`
      ) : (
        <>
          {avatar && (
            <img
              src={avatar}
              alt="Avatar"
              className="w-6 h-6 rounded-full mr-1.5"
            />
          )}
          {textOnConnected}
        </>
      )}
    </button>
  );
};

export default ButtonWithAvatar;
