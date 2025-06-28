import { prisma } from "@/lib/prisma";
import { assertValidConnection } from "@/lib/wallet";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { walletAddress } = await req.json();

    const user = await assertValidConnection(req);

    if (!user.wallet) {
      await prisma.user.update({
        where: { id: user.id },
        data: { wallet: walletAddress },
      });
      return NextResponse.json(null, { status: 204 });
    }

    throw new Error("Wallet is already linked to this account");
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 403 }
    );
  }
}
