import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { walletAddress } = await req.json();

  if (!walletAddress) {
    return NextResponse.json(
      { error: "Missing wallet address" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.wallet) {
    await prisma.user.update({
      where: { id: user.id },
      data: { wallet: walletAddress },
    });

    return NextResponse.json({ status: "first_mint" });
  }

  if (user.wallet == walletAddress) {
    const nft = await prisma.personalNFT.findUnique({
      where: { userId: user.id },
    });
    if (!nft) {
      return NextResponse.json({ status: "first_mint" });
    }
    return NextResponse.json({ status: "remint" });
  }

  return NextResponse.json(
    {
      error:
        "Wallet mismatch: your wallet is not linked to your Spotify account",
    },
    { status: 403 }
  );
}
