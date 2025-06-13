"use client";

import { ButtonProps } from "@/app/types/button.types";

import { ConnectKitButton } from "connectkit";

const WalletConnectButton: React.FC<ButtonProps> = ({ text }) => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <button className="task-button" onClick={show}>
            {isConnected ? ensName ?? truncatedAddress : text}
          </button>
        );
      }}
    </ConnectKitButton.Custom>
  );
};

export default WalletConnectButton;
