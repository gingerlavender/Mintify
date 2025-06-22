import { TaskConfig, TaskType } from "@/app/types/tasks";
import WalletConnectButton from "@/app/components/buttons/WalletConnectButton";
import SpotifyConnectButton from "@/app/components/buttons/SpotifyConnectButton";
import MintButton from "@/app/components/buttons/MintButton";

const taskConfigs: Record<TaskType, TaskConfig> = {
  walletConnect: {
    text: "Connect Your Wallet",
    ButtonComponent: WalletConnectButton,
  },
  spotifyConnect: {
    text: "Connect Your Spotify Account",
    ButtonComponent: SpotifyConnectButton,
  },
  mintNFT: {
    text: "Turn Your Music Taste Into NFT!",
    ButtonComponent: MintButton,
  },
};

export const getTaskType = (taskType: TaskType) => taskConfigs[taskType];
