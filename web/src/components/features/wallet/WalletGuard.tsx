"use client";

import { useErrorModal } from "@/hooks/modal/useErrorModal";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useAccount, useReconnect } from "wagmi";

const WalletGuard = () => {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { reconnect } = useReconnect();
  const { openErrorModal, closeErrorModal } = useErrorModal();

  const handleUserReconnect = () => {
    reconnect();
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
