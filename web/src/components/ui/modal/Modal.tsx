"use client";

import {
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogBackdrop,
} from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useRef } from "react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  disableClose?: boolean;
  loading: boolean;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  disableClose = false,
  loading,
  children,
}) => {
  const hasAnimatedRef = useRef<boolean>(false);

  const handleCloseModal = () => {
    hasAnimatedRef.current = false;
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog
          static
          open={isOpen}
          onClose={disableClose ? () => {} : handleCloseModal}
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
                if (!loading) {
                  hasAnimatedRef.current = true;
                }
              }}
              className="flex flex-col items-center max-w-[90%] md:max-w-lg space-y-4 rounded-2xl backdrop-blur-3xl bg-gray-100 p-10 transition-all duration-75 ease-linear"
            >
              <DialogTitle className="font-bold">{title}</DialogTitle>
              {loading && <p>Loading...</p>}
              {!loading && children}
            </DialogPanel>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default Modal;
