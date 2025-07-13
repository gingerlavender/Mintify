import { prisma } from "@/lib/prisma-client";
import { PermissionError } from "@/lib/errors";

import { User } from "@/generated/prisma";

export const claimMintArgsRequest = async (user: User) => {
  const updated = await prisma.user.updateMany({
    where: {
      id: user.id,
      expectedToMint: false,
    },
    data: {
      expectedToMint: true,
    },
  });
  if (updated.count === 0) {
    throw new PermissionError("Arguments for mint have been already requested");
  }
};

export const cleanupMintArgsRequest = async (user: User) => {
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      expectedToMint: false,
    },
  });
};
