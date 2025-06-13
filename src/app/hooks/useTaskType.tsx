import { taskConfig, TaskType } from "@/app/types/task.types";
import WalletConnectButton from "../components/buttons/WalletConnectButton";
import BaseButton from "../components/buttons/BaseButton";

export const useTaskType = (taskType: TaskType) => {
  const taskConfigs: Record<TaskType, taskConfig> = {
    walletConnect: {
      text: "Connect Your Wallet",
      ButtonElement: <WalletConnectButton text="Connect" />,
    },
    spotifyConnect: {
      text: "Connect Your Spotify Account",
      ButtonElement: <BaseButton text="Connect" />,
    },
    mintNFT: {
      text: "Turn Your Music Taste Into NFT!",
      ButtonElement: <BaseButton text="Let's go!" />,
    },
  };

  return taskConfigs[taskType];
};
