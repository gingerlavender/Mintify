"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";

import React, { useEffect, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { MintStatus } from "@/types/mint";
import { getMintStatus } from "@/lib/mint";

const messages: Record<MintStatus, string> = {
  first:
    "This is going to be your first mint! Let's sooner find out what you'll get!",
  repeated:
    "You can see yout current NFT below. Remember you can remint it any time!",
};

export const useMintStatusModal = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [picture, setPicture] = useState<string>("/NFTPlaceholder.png");
  const [loader, setLoader] = useState<boolean>(true);

  const { address } = useAccount();

  const hasAnimatedRef = useRef<boolean>(false);

  const openMintStatusModal = () => setIsOpen(true);

  const closeMintStatusModal = () => {
    hasAnimatedRef.current = false;
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && address) {
      setLoader(true);
      (async () => {
        try {
          const data = await getMintStatus(address);
          setMessage(messages[data.mintStatus]);
          if (data.mintStatus == "repeated") {
            setPicture(data.tokenURI);
          }
        } catch (error) {
          if (error instanceof Error) {
            setMessage(`Error: ${error.message}`);
          } else {
            setMessage("Unknown error");
          }
          setPicture("/Error.png");
        } finally {
          setLoader(false);
        }
      })();
    }
  }, [isOpen, address]);

  return {
    MintStatusModal: () => (
      <AnimatePresence>
        {isOpen && (
          <Dialog
            static
            open={isOpen}
            onClose={closeMintStatusModal}
            className="text-black font-[Inter] font-[300] relative z-50 text-center"
          >
            <DialogBackdrop className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
              <DialogPanel
                as={motion.div}
                initial={
                  hasAnimatedRef.current
                    ? { y: 0, opacity: 1 }
                    : { y: "100%", opacity: 0 }
                }
                animate={{ y: 0, opacity: 1 }}
                onAnimationComplete={() => {
                  if (!loader) {
                    hasAnimatedRef.current = true;
                  }
                }}
                className="flex flex-col items-center max-w-[90%] md:max-w-lg space-y-4 rounded-2xl backdrop-blur-3xl bg-gray-100 p-10 transition-all duration-75 ease-linear"
              >
                <DialogTitle className="font-bold">
                  Your Mint Status
                </DialogTitle>
                {loader && <p>Loading...</p>}
                {!loader && (
                  <>
                    <p>{message}</p>
                    <img
                      className="w-[50vw] md:w-[20vw] rounded-2xl"
                      src={picture}
                      alt="NFT Preview"
                    />
                    <div className="flex justify-center gap-4">
                      <button
                        className="bg-white/100 rounded-xl p-3 md:min-w-[10vw] min-w-[30vw] font-[400] hover:scale-[103%] hover:bg-white/60 cursor-pointer transition-all duration-200 shadow-xs"
                        onClick={closeMintStatusModal}
                      >
                        Mint
                      </button>
                    </div>
                  </>
                )}
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </AnimatePresence>
    ),
    openMintStatusModal,
    closeMintStatusModal,
  };
};
