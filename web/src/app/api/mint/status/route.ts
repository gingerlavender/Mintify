import { z } from "zod";
import { NextResponse } from "next/server";
//import { prisma } from "@/lib/prisma";

import {
  assertNoWalletMismatch,
  assertValidConnection,
} from "@/lib/validation";
import { MintStatusResult } from "@/types/mint";

import { isAddress } from "viem";
import { publicClientsByChainId } from "@/lib/publicClients";
import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

const MintStatusRequestSchema = z.object({
  walletAddress: z
    .string()
    .refine((val) => isAddress(val), "Invalid ETH address format"),
  chainId: z.number().refine((id) => {
    return id in publicClientsByChainId;
  }, "Invalid chain id"),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const { walletAddress, chainId } = MintStatusRequestSchema.parse(rawBody);

    const user = await assertValidConnection();
    await assertNoWalletMismatch(user, walletAddress);

    const publicClient =
      publicClientsByChainId[chainId as keyof typeof publicClientsByChainId];

    if (!publicClient) {
      throw new Error(`No public client configured for chain id ${chainId}`);
    }

    const mintifyAddress = process.env.NEXT_PUBLIC_MINTIFY_ADDRESS;

    if (!mintifyAddress || !isAddress(mintifyAddress)) {
      throw new Error("Invalid or no contract address");
    }

    const tokenUriUpdates = await publicClient.readContract({
      address: mintifyAddress,
      abi: mintifyAbi,
      functionName: "tokenUriUpdates",
      args: [walletAddress],
    });

    if (tokenUriUpdates == 0n) {
      return NextResponse.json<MintStatusResult>({ mintStatus: "first" });
    }

    /* const nft = await prisma.personalNFT.findUnique({
      where: { userId: user.id },
    });
    if (!nft) {
      return NextResponse.json<MintStatusResult>({
        mintStatus: "first",
      });
    }
    return NextResponse.json<MintStatusResult>({
      mintStatus: "repeated",
      tokenURI: nft.tokenURI, 
    }); */
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 403 }
    );
  }
}
