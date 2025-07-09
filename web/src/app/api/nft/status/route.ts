import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatEther } from "viem";

import {
  assertValidAddress,
  assertValidConnection,
} from "@/lib/api/validation";
import { ChainId, MintStatusInfo } from "@/types/mint";

import { publicClients } from "@/lib/public-clients";
import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";
import {
  handleCommonErrors,
  handleContractErrors,
  handleDatabaseErrors,
} from "@/lib/api/error-handling";

const MintStatusRequestSchema = z.object({
  chainId: z.number().refine((id): id is ChainId => id in publicClients, {
    message: "Invalid chain id",
  }),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const { chainId } = MintStatusRequestSchema.parse(rawBody);

    const user = await assertValidConnection();
    const walletAddress = assertValidAddress(user.wallet);
    const mintifyAddress = assertValidAddress(
      process.env.NEXT_PUBLIC_MINTIFY_ADDRESS
    );

    const publicClient = publicClients[chainId]!;

    const tokenUriUpdates = await publicClient.readContract({
      address: mintifyAddress,
      abi: mintifyAbi,
      functionName: "tokenUriUpdates",
      args: [walletAddress],
    });

    const nextPrice = Number(
      formatEther(
        await publicClient.readContract({
          address: mintifyAddress,
          abi: mintifyAbi,
          functionName: "getPrice",
          args: [walletAddress],
        })
      )
    );

    const nft = await prisma.personalNFT.findUnique({
      where: { userId: user.id },
    });

    if ((!nft && tokenUriUpdates !== 0n) || (nft && tokenUriUpdates === 0n)) {
      throw new Error(
        "Mismatch between mint status in blockchain and internal database"
      );
    }

    if (!nft) {
      return NextResponse.json<MintStatusInfo>({
        mintStatus: "not_minted",
        nextPrice,
      });
    }

    const tokenURI = await publicClient.readContract({
      address: mintifyAddress,
      abi: mintifyAbi,
      functionName: "tokenURI",
      args: [BigInt(nft.tokenId)],
    });

    const currentOwner = await publicClient.readContract({
      address: mintifyAddress,
      abi: mintifyAbi,
      functionName: "ownerOf",
      args: [BigInt(nft.tokenId)],
    });

    if (currentOwner != user.wallet) {
      return NextResponse.json<MintStatusInfo>({
        mintStatus: "token_transferred",
        tokenURI,
      });
    }

    return NextResponse.json<MintStatusInfo>({
      mintStatus: "minted",
      tokenURI,
      nextPrice,
    });
  } catch (error) {
    return (
      handleDatabaseErrors(error) ??
      handleContractErrors(error) ??
      handleCommonErrors(error)
    );
  }
}
