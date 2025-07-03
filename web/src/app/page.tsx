import "./globals.css";

import Soundwave from "@/components/ui/Soundwave";
import Header from "@/components/layout/Header";
import Menu from "@/components/layout/Menu";
import WalletLinker from "@/components/features/wallet/WalletLinker";
import Providers from "@/components/providers/Providers";

export default function Home() {
  return (
    <Providers>
      <Soundwave />
      <Header />
      <WalletLinker />
      <Menu />
    </Providers>
  );
}
