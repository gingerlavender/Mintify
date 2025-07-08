"use client";

import { SessionProvider } from "next-auth/react";

import { Web3Provider } from "./Web3Provider";
import { ModalProvider } from "./ModalProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

const Providers: React.FC<ProvidersProps> = ({ children }) => {
  return (
    <SessionProvider>
      <Web3Provider>
        <ModalProvider>{children}</ModalProvider>
      </Web3Provider>
    </SessionProvider>
  );
};

export default Providers;
