import { z } from "zod";
import { isHash, parseEventLogs } from "viem";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma-client";
import {
  assertValidAddress,
  assertValidConnection,
} from "@/lib/api/validation";
import {
  handleCommonErrors,
  handlePrismaErrors,
  handleViemErrors,
  PermissionError,
} from "@/lib/errors";
import { publicClients } from "@/lib/viem/public-clients";
import { MINTIFY_CONTRACT_ADDRESS } from "@/lib/constants/contracts";

import { ChainId } from "@/types/nft/mint";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

const MintVerifyRequestSchema = z.object({
  txHash: z
    .string()
    .refine((val) => isHash(val), { message: "Invalid transaction hash" }),
  chainId: z.number().refine((id): id is ChainId => id in publicClients, {
    message: "Invalid chain id",
  }),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const { txHash, chainId } = MintVerifyRequestSchema.parse(rawBody);

    const user = await assertValidConnection();
    const walletAddress = await assertValidAddress(user.wallet);

    const publicClient = publicClients[chainId]!;

    if (user.associatedTxHashes.includes(txHash)) {
      throw new PermissionError("This hash has been already used");
    }

    const receipt = await publicClient.getTransactionReceipt({ hash: txHash });

    const mintedEventLogs = parseEventLogs({
      abi: mintifyAbi,
      logs: receipt.logs,
      eventName: "Minted",
    });
    const URIUpdatedEventLogs = parseEventLogs({
      abi: mintifyAbi,
      logs: receipt.logs,
      eventName: "URIUpdated",
    });

    const isValidMintTx =
      receipt.from.toLowerCase() === walletAddress.toLowerCase() &&
      receipt.to?.toLowerCase() === MINTIFY_CONTRACT_ADDRESS.toLowerCase() &&
      (mintedEventLogs.length > 0 || URIUpdatedEventLogs.length > 0);
    if (!isValidMintTx) {
      throw new PermissionError("Mint transaction has not passed verification");
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        expectedToMint: false,
        associatedTxHashes: {
          set: [...new Set([...user.associatedTxHashes, txHash])],
        },
      },
    });

    return NextResponse.json({});
  } catch (error) {
    console.error(error);
    return (
      handlePrismaErrors(error) ??
      handleViemErrors(error) ??
      handleCommonErrors(error)
    );
  }
}
