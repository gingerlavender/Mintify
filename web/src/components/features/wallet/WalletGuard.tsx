"use client";

import { useErrorModal } from "@/hooks/modal/useErrorModal";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";

const WalletGuard = () => {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openErrorModal, closeErrorModal } = useErrorModal();

  const handleUserReconnect = () => {
    disconnect();
    closeErrorModal();
  };

  useEffect(() => {
    if (
      session?.user.wallet &&
      address &&
      isConnected &&
      session.user.wallet.toLowerCase() != address.toLowerCase()
    ) {
      openErrorModal({
        message:
          "This address is not linked to your current Spotify account. Please reconnect with correct wallet.",
        buttonText: "Disconnect",
        onClick: handleUserReconnect,
      });
    }
  }, [session, address, isConnected]);

  return null;
};

export default WalletGuard;
