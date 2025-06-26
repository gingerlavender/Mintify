import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { MintStatusResponse } from "@/types/mint";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return NextResponse.json<MintStatusResponse>(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const { walletAddress } = await req.json();

  if (!walletAddress) {
    return NextResponse.json<MintStatusResponse>(
      { error: "Missing wallet address" },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return NextResponse.json<MintStatusResponse>(
      { error: "User not found" },
      { status: 404 }
    );
  }

  if (!user.wallet) {
    await prisma.user.update({
      where: { id: user.id },
      data: { wallet: walletAddress },
    });

    return NextResponse.json<MintStatusResponse>({
      mintStatus: "first",
    });
  }

  if (user.wallet == walletAddress) {
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
  }

  return NextResponse.json<MintStatusResponse>(
    {
      error:
        "Wallet mismatch. Your wallet is not linked to your Spotify account",
    },
    { status: 403 }
  );
}
