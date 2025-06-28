"use client";

import { useErrorModal } from "@/hooks/modal/useErrorModal";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";

const WalletGuard = () => {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openErrorModal, closeErrorModal } = useErrorModal();

  const mismatchRef = useRef<boolean>(false);

  const handleUserDisconnect = () => {
    disconnect();
    mismatchRef.current = false;
    closeErrorModal();
  };

  useEffect(() => {
    const hasSession = !!session?.user.wallet;
    const hasWallet = address && isConnected;
    const walletsNotMatch =
      session?.user.wallet?.toLowerCase() != address?.toLowerCase();

    if (hasSession) {
      if (hasWallet) {
        if (walletsNotMatch) {
          if (!mismatchRef.current) {
            openErrorModal({
              message:
                "This address is not linked to your current Spotify account. Please reconnect with correct wallet.",
              buttonText: "Disconnect",
              onClick: handleUserDisconnect,
            });
            mismatchRef.current = true;
          }
        } else if (mismatchRef.current) {
          mismatchRef.current = false;
          closeErrorModal();
        }
      } else {
        mismatchRef.current = false;
        closeErrorModal();
      }
    }
  }, [session, address, isConnected]);

  return null;
};

export default WalletGuard;
