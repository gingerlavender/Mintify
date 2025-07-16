"use client";

import { useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

import ButtonWithAvatar from "@/components/ui/buttons/ButtonWithAvatar";

const SpotifyConnectButton = () => {
  const { data: session } = useSession();

  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);
  const [isSigningOut, setIsSigningOut] = useState<boolean>(false);

  const isLoading = isSigningIn || isSigningOut;

  const handleSpotifyConnect = () => {
    setIsSigningIn(true);
    signIn("spotify", { callbackUrl: "/" });
  };

  const handleSpotifyDisconnect = () => {
    setIsSigningOut(false);
    signOut();
  };

  return (
    <ButtonWithAvatar
      text={isSigningIn ? "Signing in..." : "Connect"}
      onClick={session ? handleSpotifyDisconnect : handleSpotifyConnect}
      connected={!!session}
      textOnConnected={isSigningOut ? "Signing out..." : session?.user.name}
      avatar={isLoading ? null : session?.user.image}
    />
  );
};

export default SpotifyConnectButton;
