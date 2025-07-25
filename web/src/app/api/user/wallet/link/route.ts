import { z } from "zod";
import { NextResponse } from "next/server";
import { isAddress } from "viem";

import { prisma } from "@/lib/prisma-client";
import { assertValidConnection } from "@/lib/api/validation";
import {
  handleCommonErrors,
  handlePrismaErrors,
  PermissionError,
} from "@/lib/errors";

const WalletLinkRequestSchema = z.object({
  walletAddress: z
    .string()
    .refine((val) => isAddress(val), { message: "Invalid wallet address" }),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const { walletAddress } = WalletLinkRequestSchema.parse(rawBody);

    const user = await assertValidConnection();

    if (!user.wallet) {
      await prisma.user.update({
        where: { id: user.id },
        data: { wallet: walletAddress },
      });
    } else {
      throw new PermissionError("You cannot link wallet to your account twice");
    }

    return NextResponse.json({});
  } catch (error) {
    console.error(error);
    return handlePrismaErrors(error) ?? handleCommonErrors(error);
  }
}
