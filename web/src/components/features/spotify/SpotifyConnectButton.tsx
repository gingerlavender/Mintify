"use client";

import { signIn, signOut, useSession } from "next-auth/react";

import ButtonWithAvatar from "@/components/ui/buttons/ButtonWithAvatar";

import { useLoading } from "@/hooks/common/useLoading";

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
      text={isLoading ? "Signing in..." : "Connect"}
      onClick={session ? handleSpotifyDisconnect : handleSpotifyConnect}
      connected={!!session}
      textOnConnected={isLoading ? "Signing out..." : session?.user.name}
      avatar={isLoading ? null : session?.user.image}
    />
  );
};

export default SpotifyConnectButton;
