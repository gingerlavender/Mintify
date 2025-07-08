"use client";

import { useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useAccount, useDisconnect } from "wagmi";

import { useErrorModal } from "@/hooks/modal/useErrorModal";
import { useOnceWhen } from "@/hooks/common/useOnceWhen";

import { apiRequest } from "@/lib/api/requests";

const WalletLinker = () => {
  const { data: session, update: updateSession } = useSession();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openErrorModal, closeErrorModal } = useErrorModal();

  const mismatchRef = useRef<boolean>(false);

  const resolveMismatch = useCallback(() => {
    mismatchRef.current = false;
    closeErrorModal();
  }, [closeErrorModal]);

  const handleUserConnect = () => {
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
      } else if (session?.user.wallet === null) {
        await updateSession();
      }
    })();
  };

  useOnceWhen(
    handleUserConnect,
    !!session && isConnected && !!address && !session.user.wallet
  );

  useEffect(() => {
    const hasSessionWithStoredWallet = !!session?.user.wallet;
    const loggedWithWalletProvider = address && isConnected;
    const walletsNotMatch =
      session?.user.wallet?.toLowerCase() !== address?.toLowerCase();

    if (hasSessionWithStoredWallet) {
      if (loggedWithWalletProvider) {
        if (walletsNotMatch) {
          if (!mismatchRef.current) {
            openErrorModal({
              message:
                "This address is not linked to your current Spotify account. Please reconnect with correct wallet.",
              buttonText: "Disconnect",
              onClick: () => disconnect(),
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
  }, [
    session,
    address,
    isConnected,
    openErrorModal,
    disconnect,
    resolveMismatch,
  ]);

  return null;
};

export default WalletLinker;
