import { MouseEventHandler } from "react";

export interface ButtonProps {
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export interface ButtonWithAvatarProps extends ButtonProps {
  textOnConnected: string | null | undefined;
  avatar: string | null | undefined;
  connected: boolean;
  disabled?: boolean;
}
