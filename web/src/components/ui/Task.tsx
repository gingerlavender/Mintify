import WalletConnectButton from "../features/wallet/WalletConnectButton";
import SpotifyConnectButton from "../features/spotify/SpotifyConnectButton";
import MintButton from "../features/mint/MintButton";

type TaskType = "walletConnect" | "spotifyConnect" | "mintNFT";

interface TaskConfig {
  text: string;
  ButtonComponent: React.FC;
}

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

interface TaskProps {
  taskType: TaskType;
}

const Task: React.FC<TaskProps> = ({ taskType }) => {
  const { text, ButtonComponent } = taskConfigs[taskType];

  return (
    <div className="flex flex-col md:flex-row md:justify-between font-[Inter] font-[200] text-xl rounded-3xl last:my-8 mt-8 items-center bg-green-800 p-8 shadow-xl shadow-green-950 w-[80%] text-center">
      <span>{text}</span>
      <ButtonComponent />
    </div>
  );
};

export default Task;
