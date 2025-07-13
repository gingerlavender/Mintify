import { prisma } from "@/lib/prisma-client";
import { PermissionError } from "@/lib/errors";

import { User } from "@/generated/prisma";

import {
  MILLISECONDS_IN_HOUR,
  MILLISECONDS_IN_MINUTE,
} from "@/lib/constants/time";

const MINT_ARGUMENTS_REQUEST_PROHIBITION_INTERVAL = MILLISECONDS_IN_HOUR;

export const claimMintArgsRequest = async (user: User) => {
  const updated = await prisma.user.updateMany({
    where: {
      id: user.id,
      OR: [
        { mintArgsRequested: false },
        {
          mintArgsRequestedAt: {
            lt: new Date(
              Date.now() - MINT_ARGUMENTS_REQUEST_PROHIBITION_INTERVAL
            ),
          },
        },
      ],
    },
    data: {
      mintArgsRequested: true,
      mintArgsRequestedAt: new Date(),
    },
  });
  if (updated.count === 0) {
    const minutesLeft = user.mintArgsRequestedAt
      ? Math.ceil(
          (MINT_ARGUMENTS_REQUEST_PROHIBITION_INTERVAL -
            (Date.now() - user.mintArgsRequestedAt.getTime())) /
            MILLISECONDS_IN_MINUTE
        )
      : undefined;

    throw new PermissionError(
      `Arguments have been already requested. ${
        minutesLeft !== undefined
          ? `You can receive again after ${minutesLeft} minute(s)`
          : ""
      }`
    );
  }
};

export const cleanupMintArgsRequest = async (user: User) => {
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      mintArgsRequested: false,
      mintArgsRequestedAt: null,
    },
  });
};
