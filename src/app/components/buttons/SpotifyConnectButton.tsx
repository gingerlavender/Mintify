import { ButtonProps } from "@/app/types/button.types";
import { signIn, signOut, useSession } from "next-auth/react";
import { useAccount } from "wagmi";
import ButtonWithAvatar from "./ButtonWithAvatar";

const SpotifyConnectButton = () => {
  const { data: session } = useSession();
  const { isConnected } = useAccount();

  return (
    <ButtonWithAvatar
      text="Connect"
      onClick={
        session
          ? () => signOut()
          : () => signIn("spotify", { callbackUrl: "/" })
      }
      connected={!!session}
      textOnConnected={session?.user.name}
      avatar={session?.user.image}
      disabled={!session && !isConnected}
    />
  );
};

export default SpotifyConnectButton;
