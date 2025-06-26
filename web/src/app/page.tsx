"use client";
import "./globals.css";

import Soundwave from "@/components/ui/Soundwave";
import Header from "@/components/layout/Header";
import Menu from "@/components/layout/Menu";
import { Web3Provider } from "@/components/features/wallet/Web3Provider";
import { SessionProvider } from "next-auth/react";

export default function Home() {
  return (
    <SessionProvider>
      <Web3Provider>
        <Soundwave />
        <Header />
        <Menu />
      </Web3Provider>
    </SessionProvider>
  );
}
