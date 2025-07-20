"use client";

import { useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import { useMutation } from "@tanstack/react-query";

import { useErrorModal } from "@/hooks/modal/useErrorModal";

import { apiRequest } from "@/lib/api/requests";
import { useEffect } from "react";

const WalletLinker = () => {
  const { data: session, update: updateSession } = useSession();
  const { address, isConnected } = useAccount();
  const { openModal: openErrorModal } = useErrorModal();

  const { mutate: linkWallet } = useMutation({
    mutationFn: async () => {
      const result = await apiRequest("api/user/wallet/link", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          walletAddress: address,
        }),
      });
      if (!result.success) {
        throw new Error(result.error);
      }
      await updateSession();
    },
    onError: (error) => openErrorModal({ message: error.message }),
  });

  useEffect(() => {
    if (!!session && isConnected && !!address && !session.user.wallet) {
      linkWallet();
    }
  }, [session, isConnected, address, linkWallet]);

  return null;
};

export default WalletLinker;
