"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import ButtonWithAvatar from "@/components/ui/buttons/ButtonWithAvatar";
import { useEffect } from "react";

const SpotifyConnectButton = () => {
  const { data: session } = useSession();
  const { isConnected, address } = useAccount();

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
          let message;
          if (error instanceof Error) {
            message = error.message;
          } else {
            message = "Unknown error";
          }
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
