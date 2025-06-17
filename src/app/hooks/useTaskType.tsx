"use client";

import { taskConfig, TaskType } from "@/app/types/task.types";
import WalletConnectButton from "../components/buttons/WalletConnectButton";
import BaseButton from "../components/buttons/BaseButton";
import { signIn, signOut, useSession } from "next-auth/react";
import ButtonWithAvatar from "../components/buttons/ButtonWithAvatar";

export const useTaskType = (taskType: TaskType) => {
  const { data: session } = useSession();

  const taskConfigs: Record<TaskType, taskConfig> = {
    walletConnect: {
      text: "Connect Your Wallet",
      ButtonElement: <WalletConnectButton text="Connect" />,
    },
    spotifyConnect: {
      text: "Connect Your Spotify Account",
      ButtonElement: (
        <ButtonWithAvatar
          text="Connect"
          onClick={
            session
              ? () => signOut()
              : () => signIn("spotify", { callbackUrl: "/" })
          }
          connected={session != undefined}
          textOnConnected={session?.user.name}
          avatar={session?.user.image}
        />
      ),
    },
    mintNFT: {
      text: "Turn Your Music Taste Into NFT!",
      ButtonElement: <BaseButton text="Let's go!" />,
    },
  };

  return taskConfigs[taskType];
};
