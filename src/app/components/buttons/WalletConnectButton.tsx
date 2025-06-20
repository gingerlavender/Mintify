"use client";

import { ButtonProps } from "@/app/types/button.types";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { isMobile, isMetaMaskBrowser, metamaskDeepLink } from "@/lib/mobile";
import ButtonWithAvatar from "./ButtonWithAvatar";

const WalletConnectButton: React.FC<ButtonProps> = ({ text }) => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openConnectModal,
        openAccountModal,
        openChainModal,
        mounted,
        authenticationStatus,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");

        const handleConnectClick = () => {
          if (!connected) {
            if (isMobile() && !isMetaMaskBrowser()) {
              window.location.href = metamaskDeepLink();
            } else {
              openConnectModal?.();
            }
          } else {
            openAccountModal?.();
          }
        };

        return (
          <div className="flex flex-wrap justify-center min-w-[50%] md:min-w-[18%]">
            <ButtonWithAvatar
              onClick={handleConnectClick}
              text={text}
              textOnConnected={
                account?.ensName ??
                `${account?.address.slice(0, 6)}...${account?.address.slice(
                  -4
                )}`
              }
              avatar={account?.ensAvatar}
              disabled={!ready}
              connected={connected}
            />

            {connected && (
              <>
                {chain.unsupported ? (
                  <button
                    className="task-button min-w-fit ml-2 bg-red-500 text-white"
                    onClick={openChainModal}
                  >
                    Unsupported Network
                  </button>
                ) : (
                  <button
                    className="task-button min-w-fit ml-2"
                    onClick={openChainModal}
                  >
                    {chain.name}
                  </button>
                )}
              </>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnectButton;
