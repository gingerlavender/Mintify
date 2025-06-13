"use client";

import { Config, WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, optimism } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { useEffect, useState } from "react";

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<Config>();
  const [queryClient, setQueryClient] = useState<QueryClient>();

  useEffect(() => {
    const cfg = createConfig(
      getDefaultConfig({
        chains: [mainnet, optimism],
        transports: {
          [mainnet.id]: http(`${process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_URL}`),
          [optimism.id]: http(
            `${process.env.NEXT_PUBLIC_ALCHEMY_OPMAINNET_URL}`
          ),
        },
        walletConnectProjectId:
          process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
        appName: "Mintify",
      })
    );

    setConfig(cfg);
    setQueryClient(new QueryClient());
    setMounted(true);
  }, []);

  return (
    <>
      {mounted && config && queryClient && (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider>{children}</ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      )}
    </>
  );
};
