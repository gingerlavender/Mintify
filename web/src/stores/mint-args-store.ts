import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  MintArgsWithSignature,
  RemintArgsWithSignature,
} from "@/types/nft/mint";

type MintArgsStore = {
  args: MintArgsWithSignature | RemintArgsWithSignature | null;
  setArgs: (args: MintArgsWithSignature | RemintArgsWithSignature) => void;
  resetArgs: () => void;
};

export const useMintArgsStore = create<MintArgsStore>()(
  persist(
    (set) => ({
      args: null,
      setArgs: (args) => set({ args }),
      resetArgs: () => set({ args: null }),
    }),
    { name: "mint-args-store" }
  )
);
