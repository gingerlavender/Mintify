"use client";
import "./globals.css";

import Soundwave from "./components/Soundwave";
import Header from "./components/Header";
import Menu from "./components/Menu";
import { Web3Provider } from "./components/Web3Provider";
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
