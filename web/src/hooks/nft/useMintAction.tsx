import { MintAction } from "@/types/nft/mint";

import { useMintNFT } from "./useMintNFT";
import { useRemintNFT } from "./useRemintNFT";

export const useMintAction = (action: MintAction) => {
  const mintNFT = useMintNFT();
  const remintNFT = useRemintNFT();

  return action === MintAction.Mint ? mintNFT : remintNFT;
};
