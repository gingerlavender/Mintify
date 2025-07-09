import { z } from "zod";
import { NextResponse } from "next/server";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

import { prisma } from "@/lib/prisma-client";
import { MINTIFY_CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import {
  handleCommonErrors,
  handleViemErrors,
  handlePrismaErrors,
  PermissionError,
} from "@/lib/errors";
import { publicClients } from "@/lib/viem/public-clients";
import {
  assertValidAddress,
  assertValidConnection,
} from "@/lib/api/validation";

import { ChainId } from "@/types/nft/mint";

const TokenSaveRequestSchema = z.object({
  tokenId: z
    .string()
    .regex(/^\d+$/, { message: "Token id must be non-negative integer" })
    .refine((id) => BigInt(id) > 0n && BigInt(id) <= 2n ** 256n - 1n, {
      message: "Token id must be in range from 1 to 2^256 - 1",
    }),
  chainId: z
    .number()
    .refine((id): id is ChainId => id in publicClients, "Invalid chain id"),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const { tokenId, chainId } = TokenSaveRequestSchema.parse(rawBody);

    const user = await assertValidConnection();
    const walletAddress = assertValidAddress(user.wallet);

    const publicClient = publicClients[chainId]!;

    const tokenOwner = await publicClient.readContract({
      address: MINTIFY_CONTRACT_ADDRESS,
      abi: mintifyAbi,
      functionName: "ownerOf",
      args: [BigInt(tokenId)],
    });

    if (tokenOwner.toLowerCase() != walletAddress.toLowerCase()) {
      throw new PermissionError("You are not a token owner");
    }

    await prisma.personalNFT.create({
      data: {
        userId: user.id,
        tokenId: tokenId.toString(),
      },
    });

    return NextResponse.json({});
  } catch (error) {
    console.error(error);
    return (
      handlePrismaErrors(error) ??
      handleViemErrors(error) ??
      handleCommonErrors(error)
    );
  }
}
