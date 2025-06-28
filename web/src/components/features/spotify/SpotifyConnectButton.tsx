"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import ButtonWithAvatar from "@/components/ui/buttons/ButtonWithAvatar";

const SpotifyConnectButton = () => {
  const { data: session } = useSession();
  const { isConnected, address } = useAccount();

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
