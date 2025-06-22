"use client";

import { TaskConfig, TaskType } from "@/app/types/task.types";
import WalletConnectButton from "../components/buttons/WalletConnectButton";
import SpotifyConnectButton from "../components/buttons/SpotifyConnectButton";
import MintButton from "../components/buttons/MintButton";

export const useTaskType = (taskType: TaskType) => {
  const taskConfigs: Record<TaskType, TaskConfig> = {
    walletConnect: {
      text: "Connect Your Wallet",
      ButtonComponent: () => <WalletConnectButton />,
    },
    spotifyConnect: {
      text: "Connect Your Spotify Account",
      ButtonComponent: () => <SpotifyConnectButton />,
    },
    mintNFT: {
      text: "Turn Your Music Taste Into NFT!",
      ButtonComponent: () => <MintButton />,
    },
  };

  return taskConfigs[taskType];
};
