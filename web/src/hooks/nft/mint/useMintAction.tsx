import { MintAction } from "@/types/nft/state";

import { useMintNFT } from "./useMintNFT";
import { useRemintNFT } from "./useRemintNFT";

export const useMintAction = (action: MintAction) => {
  const mintNFT = useMintNFT();
  const remintNFT = useRemintNFT();

  return action === "mint" ? mintNFT : remintNFT;
};
