"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useAccount, useSwitchAccount } from "wagmi";
import ButtonWithAvatar from "@/components/ui/buttons/ButtonWithAvatar";
import { useEffect } from "react";
import { useErrorModal } from "@/hooks/modal/useErrorModal";

const SpotifyConnectButton = () => {
  const { data: session } = useSession();
  const { isConnected, address } = useAccount();

  const { openErrorModal } = useErrorModal();

  useEffect(() => {
    if (session && isConnected && address && !session.user.wallet) {
      (async () => {
        try {
          const resp = await fetch("api/user/wallet/link", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              walletAddress: address,
            }),
          });
          const data = await resp.json();
          if (!resp.ok) {
            throw new Error(data.error ?? "Unknown error");
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          openErrorModal({ message });
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
