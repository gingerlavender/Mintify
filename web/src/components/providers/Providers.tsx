"use client";

import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

import { Web3Provider } from "./Web3Provider";
import { ModalProvider } from "./ModalProvider";
import MintProcessProvider from "./MintProcessProvider";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <Web3Provider>
        <MintProcessProvider>
          <ModalProvider>{children}</ModalProvider>
        </MintProcessProvider>
      </Web3Provider>
    </SessionProvider>
  );
};

export default Providers;
