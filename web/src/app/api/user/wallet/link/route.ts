import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const { walletAddress } = await req.json();

  if (!session || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return NextResponse.json(null, { status: 204 });
  }

  return NextResponse.json(
    { error: "Wallet is already linked to this account" },
    { status: 403 }
  );
}
