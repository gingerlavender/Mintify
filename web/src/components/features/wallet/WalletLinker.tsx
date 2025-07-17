"use client";

import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";

import { useErrorModal } from "@/hooks/modal/useErrorModal";
import { useOnceWhen } from "@/hooks/common/useOnceWhen";

import { apiRequest } from "@/lib/api/requests";

const WalletLinker = () => {
  const { data: session, update: updateSession } = useSession();
  const { address, isConnected } = useAccount();
  const { openModal: openErrorModal } = useErrorModal();

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

  return null;
};

export default WalletLinker;
