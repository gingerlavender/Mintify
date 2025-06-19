export type TaskType = "walletConnect" | "spotifyConnect" | "mintNFT";

export interface TaskProps {
  taskType: TaskType;
}

export interface TaskConfig {
  text: string;
  ButtonElement: JSX.Element;
}
