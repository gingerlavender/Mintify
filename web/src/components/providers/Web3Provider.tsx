"use client";

import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Config, WagmiProvider, http } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { optimism, optimismSepolia } from "wagmi/chains";

const queryClient = new QueryClient();

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<Config>();

  useEffect(() => {
    const cfg = getDefaultConfig({
      appName: "Mintify",
      projectId: `${process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}`,
      chains: [
        optimism,
        ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS == "true"
          ? [optimismSepolia]
          : []),
      ],
      transports: {
        [optimism.id]: http(process.env.NEXT_PUBLIC_ALCHEMY_OPMAINNET_URL),
        [optimismSepolia.id]: http(
          process.env.NEXT_PUBLIC_ALCHEMY_OPSEPOLIA_URL
        ),
      },
      ssr: true,
    });

    setConfig(cfg);
  }, []);

  return (
    <>
      {config && (
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <RainbowKitProvider>{children}</RainbowKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      )}
    </>
  );
}
