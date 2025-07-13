"use client";

import { createContext, useState, ReactNode, useCallback } from "react";

import Modal from "../ui/modal/Modal";

interface ModalOptions {
  title: string | null;
  content: ReactNode;
  disableClose?: boolean;
}

interface ModalState extends ModalOptions {
  isOpen: boolean;
}

export interface ModalContextType {
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
  disableClose: () => void;
  enableClose: () => void;
}

export const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    content: null,
    title: null,
    disableClose: false,
  });

  const openModal = useCallback(
    ({ disableClose = false, ...options }: ModalOptions) =>
      setModal({ disableClose, ...options, isOpen: true }),
    []
  );

  const closeModal = useCallback(
    () => setModal((prev) => ({ ...prev, isOpen: false })),
    []
  );

  const disableClose = useCallback(
    () => setModal((prev) => ({ ...prev, disableClose: true })),
    []
  );

  const enableClose = useCallback(
    () => setModal((prev) => ({ ...prev, disableClose: false })),
    []
  );

  return (
    <ModalContext.Provider
      value={{ openModal, closeModal, disableClose, enableClose }}
    >
      {children}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title ?? ""}
        disableClose={modal.disableClose}
      >
        {modal.content}
      </Modal>
    </ModalContext.Provider>
  );
};
