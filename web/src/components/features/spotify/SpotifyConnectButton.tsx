"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import ButtonWithAvatar from "@/components/ui/buttons/ButtonWithAvatar";
import { useEffect } from "react";
import { useErrorModal } from "@/hooks/modal/useErrorModal";
import { apiRequest } from "@/lib/api";

const SpotifyConnectButton = () => {
  const { data: session } = useSession();
  const { isConnected, address } = useAccount();

  const { openErrorModal } = useErrorModal();

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

  const handleSpotifyConnect = () => signIn("spotify", { callbackUrl: "/" });
  const handleSpotifyDisconnect = () => signOut();

  return (
    <ButtonWithAvatar
      text="Connect"
      onClick={session ? handleSpotifyDisconnect : handleSpotifyConnect}
      connected={!!session}
      textOnConnected={session?.user.name}
      avatar={session?.user.image}
      disabled={!session && !isConnected}
    />
  );
};

export default SpotifyConnectButton;
