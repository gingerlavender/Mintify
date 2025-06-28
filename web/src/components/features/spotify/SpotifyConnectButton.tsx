"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import ButtonWithAvatar from "@/components/ui/buttons/ButtonWithAvatar";
import { useLoading } from "@/hooks/useLoading";

const SpotifyConnectButton = () => {
  const { data: session } = useSession();
  const { isLoading, startLoading } = useLoading(false);

  const handleSpotifyConnect = () => {
    startLoading();
    signIn("spotify", { callbackUrl: "/" });
  };

  const handleSpotifyDisconnect = () => {
    startLoading();
    signOut();
  };

  return (
    <ButtonWithAvatar
      text={isLoading ? "Loading..." : "Connect"}
      onClick={session ? handleSpotifyDisconnect : handleSpotifyConnect}
      connected={!!session}
      textOnConnected={session?.user.name}
      avatar={session?.user.image}
    />
  );
};

export default SpotifyConnectButton;
