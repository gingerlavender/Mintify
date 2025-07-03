"use client";

import { Web3Provider } from "./Web3Provider";
import { SessionProvider } from "next-auth/react";
import { ModalProvider } from "./ModalProvider";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
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
