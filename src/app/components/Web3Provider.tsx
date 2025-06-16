"use client";

import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Config, WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, optimism } from "wagmi/chains";
import { useEffect, useState } from "react";

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [config, setConfig] = useState<Config>();
  const [queryClient, setQueryClient] = useState<QueryClient>();

  useEffect(() => {
    const cfg = getDefaultConfig({
      appName: "Mintify",
      projectId: `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`,
      chains: [mainnet, optimism],
      ssr: true,
    });

    setConfig(cfg);
    setQueryClient(new QueryClient());
    setMounted(true);
  }, []);

  return (
    <>
      {mounted && config && queryClient && (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>{children}</RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      )}
    </>
  );
}
