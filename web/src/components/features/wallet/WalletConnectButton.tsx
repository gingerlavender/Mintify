"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useSession } from "next-auth/react";

import ButtonWithAvatar from "@/components/ui/buttons/ButtonWithAvatar";

const WalletConnectButton = () => {
  const { data: session } = useSession();

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
            openConnectModal?.();
          } else {
            openAccountModal?.();
          }
        };

        return (
          <div className="flex flex-wrap justify-center min-w-[50%] md:min-w-[18%]">
            <ButtonWithAvatar
              onClick={handleConnectClick}
              text="Connect"
              textOnConnected={
                account?.ensName ??
                `${account?.address.slice(0, 6)}...${account?.address.slice(
                  -4
                )}`
              }
              avatar={account?.ensAvatar}
              disabled={!ready || (!session && !connected)}
              connected={connected}
            />

            {connected && (
              <>
                {chain.unsupported ? (
                  <button
                    className="task-button min-w-fit ml-2.5 bg-red-500 text-white"
                    onClick={openChainModal}
                  >
                    Unsupported Network
                  </button>
                ) : (
                  <button
                    className="task-button min-w-fit ml-2.5"
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
