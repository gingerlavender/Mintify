export type TaskType = "walletConnect" | "spotifyConnect" | "mintNFT";

export interface TaskConfig {
  text: string;
  ButtonComponent: React.FC;
}
