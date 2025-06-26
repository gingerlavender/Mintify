import { TaskConfig, TaskType } from "@/types/tasks";
import WalletConnectButton from "@/components/features/wallet/WalletConnectButton";
import SpotifyConnectButton from "@/components/features/spotify/SpotifyConnectButton";
import MintButton from "@/components/features/mint/MintButton";

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
