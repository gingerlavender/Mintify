import { MouseEventHandler } from "react";

export interface ButtonProps {
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface ButtonWithAvatarProps extends ButtonProps {
  textOnConnected: string;
  connected?: boolean;
  avatar?: string;
  disabled?: boolean;
}
