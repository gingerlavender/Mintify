import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { MintStatusResponse } from "@/app/types/mint.types";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return NextResponse.json<MintStatusResponse>(
      { success: "false", error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { walletAddress } = await req.json();

  if (!walletAddress) {
    return NextResponse.json<MintStatusResponse>(
      { success: "false", error: "Missing wallet address" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json<MintStatusResponse>(
      { success: "false", error: "User not found" },
      { status: 404 }
    );
  }

  if (!user.wallet) {
    await prisma.user.update({
      where: { id: user.id },
      data: { wallet: walletAddress },
    });

    return NextResponse.json<MintStatusResponse>({
      success: "true",
      mintStatus: "first",
    });
  }

  if (user.wallet == walletAddress) {
    const nft = await prisma.personalNFT.findUnique({
      where: { userId: user.id },
    });
    if (!nft) {
      return NextResponse.json<MintStatusResponse>({
        success: "true",
        mintStatus: "first",
      });
    }
    return NextResponse.json<MintStatusResponse>({
      success: "true",
      mintStatus: "repeated",
    });
  }

  return NextResponse.json<MintStatusResponse>(
    {
      success: "false",
      error:
        "wallet mismatch. Your wallet is not linked to your Spotify account",
      mintStatus: "none",
    },
    { status: 403 }
  );
}
