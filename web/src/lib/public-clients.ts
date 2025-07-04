import { createPublicClient, http } from "viem";
import { mainnet, optimism, optimismSepolia } from "viem/chains";

export const publicClientsByChainId = {
  1: createPublicClient({
    chain: mainnet,
    transport: http(process.env.NEXT_PUBLIC_ALCHEMY_MAINNET_URL),
  }),
  10: createPublicClient({
    chain: optimism,
    transport: http(process.env.NEXT_PUBLIC_ALCHEMY_OPMAINNET_URL),
  }),
  ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === "true" && {
    11155420: createPublicClient({
      chain: optimismSepolia,
      transport: http(process.env.NEXT_PUBLIC_ALCHEMY_OPSEPOLIA_URL),
    }),
  }),
} as const;

export const getPublicClientByChainId = (chainId: number) => {
  const publicClient =
    publicClientsByChainId[chainId as keyof typeof publicClientsByChainId];

  if (!publicClient) {
    throw new Error(`No public client configured for chain id ${chainId}`);
  }
  return publicClient;
};
