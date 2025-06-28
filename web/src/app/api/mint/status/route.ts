import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  assertNoWalletMismatch,
  assertValidConnection,
} from "@/lib/validation";
import { MintStatusResult } from "@/types/mint";

const MintStatusRequestSchema = z.object({
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid ETH address format"),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const { walletAddress } = MintStatusRequestSchema.parse(rawBody);

    const user = await assertValidConnection();
    await assertNoWalletMismatch(user, walletAddress);

    const nft = await prisma.personalNFT.findUnique({
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
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 403 }
    );
  }
}
