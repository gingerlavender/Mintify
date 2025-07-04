import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { prisma } from "@/lib/prisma";
import { isAddress } from "viem";

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

export const assertValidAddress = (address: string | null | undefined) => {
  if (!address || !isAddress(address)) {
    throw new Error("Missing or incorrect address");
  }

  return address;
};
