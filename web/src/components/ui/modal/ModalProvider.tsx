"use client";

import { createContext, useState, ReactNode, useCallback } from "react";
import Modal from "./Modal";

interface ModalOptions {
  title: string | null;
  content: ReactNode;
  loading: boolean;
  disableClose?: boolean;
}

interface ModalState extends ModalOptions {
  isOpen: boolean;
}

export interface ModalContextType {
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
  endLoading: () => void;
}

export const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    content: null,
    title: null,
    loading: false,
    disableClose: false,
  });

  const openModal = useCallback(
    ({ disableClose = false, loading = false, ...options }: ModalOptions) =>
      setModal({ disableClose, loading, ...options, isOpen: true }),
    []
  );

  const closeModal = useCallback(
    () => setModal((prev) => ({ ...prev, isOpen: false })),
    []
  );

  const endLoading = () => {
    setModal((prev) => ({ ...prev, loading: false }));
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal, endLoading }}>
      {children}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        title={modal.title ?? ""}
        loading={modal.loading}
        disableClose={modal.disableClose}
      >
        {modal?.content}
      </Modal>
    </ModalContext.Provider>
  );
};
