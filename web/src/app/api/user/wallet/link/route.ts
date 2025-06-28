import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { assertValidConnection } from "@/lib/validation";

const WalletLinkRequestSchema = z.object({
  walletAddress: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid ETH address format"),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const { walletAddress } = WalletLinkRequestSchema.parse(rawBody);

    const user = await assertValidConnection();

    if (!user.wallet) {
      await prisma.user.update({
        where: { id: user.id },
        data: { wallet: walletAddress },
      });
      return new NextResponse(null, { status: 204 });
    }

    throw new Error("Some wallet is already linked to this account");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 403 }
    );
  }
}
