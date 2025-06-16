"use client";

import { taskConfig, TaskType } from "@/app/types/task.types";
import WalletConnectButton from "../components/buttons/WalletConnectButton";
import BaseButton from "../components/buttons/BaseButton";
import { signIn, signOut, useSession } from "next-auth/react";

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
        <BaseButton
          text={session ? session.user.name ?? "idk" : "Connect"}
          onClick={session ? () => signOut() : () => signIn()}
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
