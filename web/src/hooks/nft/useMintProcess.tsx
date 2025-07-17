import { useContext } from "react";

import { MintProcessContext } from "@/components/providers/MintProcessProvider";

export const useMintProcess = () => {
  const context = useContext(MintProcessContext);
  if (!context) {
    throw new Error("useMintProcess must be used inside MintProcessProvider");
  }
  return context;
};
