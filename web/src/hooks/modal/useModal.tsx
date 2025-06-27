"use client";

import {
  ModalContext,
  ModalContextType,
} from "@/components/ui/modal/ModalProvider";
import { useContext } from "react";

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used inside ModalProvider");
  }
  return context;
};
