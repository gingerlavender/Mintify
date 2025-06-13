import React, { MouseEventHandler } from "react";

export type TaskType = "walletConnect" | "spotifyConnect" | "mintNFT";

export interface TaskProps {
  taskType: TaskType;
}

export interface taskConfig {
  text: string;
  ButtonElement: JSX.Element;
}
