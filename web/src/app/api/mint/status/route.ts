import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { MintStatusResponse } from "@/types/mint";
import { assertNoWalletMismatch, assertValidConnection } from "@/lib/wallet";

export async function POST(req: Request) {
  try {
    const user = await assertValidConnection(req);
    await assertNoWalletMismatch(req);

    const nft = await prisma.personalNFT.findUnique({
      where: { userId: user.id },
    });
    if (!nft) {
      return NextResponse.json<MintStatusResponse>({
        mintStatus: "first",
      });
    }
    return NextResponse.json<MintStatusResponse>({
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
