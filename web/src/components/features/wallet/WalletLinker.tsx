"use client";

import { useErrorModal } from "@/hooks/modal/useErrorModal";
import { apiRequest } from "@/lib/api";
import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { useAccount, useDisconnect } from "wagmi";

const WalletLinker = () => {
  const { data: session } = useSession();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openErrorModal, closeErrorModal } = useErrorModal();

  const mismatchRef = useRef<boolean>(false);

  const resolveMismatch = () => {
    mismatchRef.current = false;
    closeErrorModal();
  };

  const handleUserDisconnect = () => {
    disconnect();
  };

  useEffect(() => {
    if (session && isConnected && address && !session.user.wallet) {
      (async () => {
        const result = await apiRequest("api/user/wallet/link", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            walletAddress: address,
          }),
        });
        if (!result.success) {
          openErrorModal({ message: result.error });
        }
      })();
    }
  }, [session, isConnected, address]);

  useEffect(() => {
    const hasSessionWithStoredWallet = !!session?.user.wallet;
    const loggedWithWalletProvider = address && isConnected;
    const walletsNotMatch =
      session?.user.wallet?.toLowerCase() != address?.toLowerCase();

    if (hasSessionWithStoredWallet) {
      if (loggedWithWalletProvider) {
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
          resolveMismatch();
        }
      } else if (mismatchRef.current) {
        resolveMismatch();
      }
    }
  }, [session, address, isConnected]);

  return null;
};

export default WalletLinker;
