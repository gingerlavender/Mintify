import "./globals.css";

import Soundwave from "./components/Soundwave";
import Header from "./components/Header";
import Menu from "./components/Menu";
import { Web3Provider } from "./components/Web3Provider";

export default function Home() {
  return (
    <Web3Provider>
      <Soundwave />
      <Header />
      <Menu />
    </Web3Provider>
  );
}
