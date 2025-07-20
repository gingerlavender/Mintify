"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
  CloseButton,
} from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  disableClose?: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  disableClose = false,
  children,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={disableClose ? () => {} : onClose}
          className="text-black font-[Inter] font-[300] relative z-50 text-center"
        >
          <DialogBackdrop className="fixed inset-0 bg-black/30" />
          <div className="fixed inset-0 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <DialogPanel
                as={motion.div}
                initial={{ y: "10vh", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="flex flex-col items-center max-w-[90%] md:max-w-lg space-y-4 rounded-2xl backdrop-blur-3xl bg-gray-100 p-10 pt-3.5 transition-all duration-[20ms] ease-in-out"
              >
                {!disableClose && (
                  <CloseButton className="relative left-6 text-right text-sm font-[400] my-0 text-white self-end py-0.5 px-1.5 rounded-md bg-gray-300/80 hover:opacity-60 cursor-pointer transition-all duration-200 shadow-xs">
                    X
                  </CloseButton>
                )}
                <DialogTitle className="font-bold">{title}</DialogTitle>
                {children}
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default Modal;
