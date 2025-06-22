"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";

import React, { useState } from "react";
import { MintStatusModalProps } from "../types/mint";

export const useMintStatusModal = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const close = () => setIsOpen(false);
  const open = () => setIsOpen(true);

  return {
    MintStatusModal: ({ message }: MintStatusModalProps) => (
      <AnimatePresence>
        {isOpen && (
          <Dialog
            static
            open={isOpen}
            onClose={close}
            className="text-black font-[Inter] font-[300] relative z-50 text-center"
          >
            <DialogBackdrop className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
              <DialogPanel
                as={motion.div}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center max-w-[90%] md:max-w-lg space-y-4 rounded-2xl backdrop-blur-3xl bg-gray-100 p-10 transition-all duration-75 ease-linear"
              >
                <DialogTitle className="font-bold">
                  Your Mint Status
                </DialogTitle>
                <p>{message}</p>
                <img
                  className="w-[50vw] md:w-[20vw] rounded-2xl"
                  src="/NFTPlaceholder.png"
                  alt="NFT Preview"
                />
                <div className="flex justify-center gap-4">
                  <button
                    className="bg-white/100 rounded-xl p-3 md:min-w-[10vw] min-w-[30vw] font-[400] hover:scale-[103%] hover:bg-white/60 cursor-pointer transition-all duration-200 shadow-xs"
                    onClick={close}
                  >
                    Mint
                  </button>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    ),
    open,
    close,
  };
};
