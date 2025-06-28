import React from "react";
import { ButtonProps } from "./Button";

export interface ButtonWithAvatarProps extends ButtonProps {
  textOnConnected: string | null | undefined;
  avatar: string | null | undefined;
  connected: boolean | undefined;
}

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
      className={`task-button flex flex-wrap justify-center ${
        connected == undefined ? "w-full" : ""
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
