import { getServerSession, User } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "@/lib/prisma";

export const assertValidConnection = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const assertNoWalletMismatch = async (
  user: User,
  walletAddress: string
) => {
  if (user.wallet != walletAddress) {
    throw new Error(
      "Wallet mismatch. Your wallet is not linked to your Spotify account"
    );
  }
};
