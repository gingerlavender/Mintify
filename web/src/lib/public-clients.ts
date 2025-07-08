import { createPublicClient, http } from "viem";
import { mainnet, optimism, optimismSepolia } from "viem/chains";

export const publicClients = {
  [mainnet.id]: createPublicClient({
    chain: mainnet,
    transport: http(process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_URL),
  }),
  [optimism.id]: createPublicClient({
    chain: optimism,
    transport: http(process.env.NEXT_PUBLIC_ALCHEMY_OPMAINNET_URL),
  }),
  ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" && {
    [optimismSepolia.id]: createPublicClient({
      chain: optimismSepolia,
      transport: http(process.env.NEXT_PUBLIC_ALCHEMY_OPSEPOLIA_URL),
    }),
  }),
} as const;
