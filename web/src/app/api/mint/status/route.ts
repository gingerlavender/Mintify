import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAddress } from "viem";

import {
  assertNoWalletMismatch,
  assertValidConnection,
} from "@/lib/validation";
import { MintStatusResult } from "@/types/mint";

import { publicClientsByChainId } from "@/lib/publicClients";
import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";
import { MintStatus } from "@/types/mint";

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

    const nextPrice = await publicClient.readContract({
      address: mintifyAddress,
      abi: mintifyAbi,
      functionName: "getUpdatePrice",
      args: [walletAddress],
    });

    const nft = await prisma.personalNFT.findUnique({
      where: { userId: user.id },
    });

    if ((!nft && tokenUriUpdates != 0n) || (nft && tokenUriUpdates == 0n)) {
      throw new Error(
        "Mismatch between mint status in blockchain and internal database"
      );
    }

    if (!nft) {
      return NextResponse.json<MintStatusResult>({
        mintStatus: MintStatus.NotMinted,
        nextPrice,
      });
    }

    const tokenURI = await publicClient.readContract({
      address: mintifyAddress,
      abi: mintifyAbi,
      functionName: "tokenURI",
      args: [BigInt(nft.tokenId)],
    });

    const currentOwner = await publicClient.readContract({
      address: mintifyAddress,
      abi: mintifyAbi,
      functionName: "ownerOf",
      args: [BigInt(nft.tokenId)],
    });

    if (currentOwner != walletAddress) {
      return NextResponse.json<MintStatusResult>({
        mintStatus: MintStatus.TokenTransferred,
        tokenURI,
      });
    }

    return NextResponse.json<MintStatusResult>({
      mintStatus: MintStatus.Minted,
      tokenURI,
      nextPrice,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 403 }
    );
  }
}
