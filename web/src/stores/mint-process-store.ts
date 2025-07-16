import { create } from "zustand";

import { MintStep } from "@/types/nft/mint";

type MintProcessState = {
  status: "idle" | "pending" | "success" | "error";
  isIdle: boolean;
  isPending: boolean;
  isSuccess: boolean;
  currentStep: MintStep;
} & ({ isError: true; error: Error } | { isError: false; error: null });

type MintProcessActions = {
  setCurrentStep: (step: MintStep) => void;
  setPending: () => void;
  setSuccess: () => void;
  setError: (error: Error) => void;
  resetMintProcess: () => void;
};

type MintProcessStore = MintProcessState & MintProcessActions;

const initialState: MintProcessState = {
  status: "idle",
  isIdle: true,
  isPending: false,
  isSuccess: false,
  isError: false,
  error: null,
  currentStep: MintStep.Idle,
};

export const useMintProcessStore = create<MintProcessStore>()((set) => ({
  ...initialState,
  setCurrentStep: (step) => set({ currentStep: step }),
  setPending: () =>
    set({
      status: "pending",
      isIdle: false,
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null,
    }),
  setSuccess: () =>
    set({
      status: "success",
      isIdle: false,
      isPending: false,
      isSuccess: true,
      isError: false,
      error: null,
    }),
  setError: (error) =>
    set({
      status: "error",
      isIdle: false,
      isPending: false,
      isSuccess: false,
      isError: true,
      error,
    }),
  resetMintProcess: () => set(initialState),
}));
