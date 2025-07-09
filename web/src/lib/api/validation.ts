import { getServerSession } from "next-auth";
import { isAddress } from "viem";

import { authOptions } from "../auth";
import { prisma } from "../prisma-client";
import { AuthError, ValidationError } from "../errors";

export const assertValidConnection = async () => {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    throw new AuthError("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });
  if (!user) {
    throw new ValidationError("User not found");
  }

  return user;
};

export const assertValidAddress = (address: string | null | undefined) => {
  if (!address || !isAddress(address)) {
    throw new ValidationError("Missing or incorrect contract address");
  }

  return address;
};
