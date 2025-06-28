import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "@/lib/prisma";

export const assertValidConnection = async (req: Request) => {
  const session = await getServerSession(authOptions);
  const { walletAddress } = await req.json();

  if (!session || !session.user.id) {
    throw new Error("Unauthorized");
  }

  if (!walletAddress) {
    throw new Error("Missing wallet address");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const assertNoWalletMismatch = async (req: Request) => {
  const { walletAddress } = await req.json();

  const user = await assertValidConnection(req);

  if (user.wallet != walletAddress) {
    throw new Error(
      "Wallet mismatch. Your wallet is not linked to your Spotify account"
    );
  }
};
