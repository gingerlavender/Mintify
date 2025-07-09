import { z } from "zod";
import { NextResponse } from "next/server";
import { formatEther } from "viem";

import { prisma } from "@/lib/prisma-client";
import {
  assertValidAddress,
  assertValidConnection,
} from "@/lib/api/validation";
import { MINTIFY_CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import {
  handleCommonErrors,
  handleViemErrors,
  handlePrismaErrors,
  RequestError,
} from "@/lib/errors";
import { apiRequest } from "@/lib/api/requests";
import { publicClients } from "@/lib/viem/public-clients";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

import { ChainId } from "@/types/nft/mint";
import { NFTInfo, NFTStatus } from "@/types/nft/state";
import { NFTMetadata } from "@/types/nft/metadata";

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

    const publicClient = publicClients[chainId]!;

    const tokenUriUpdates = await publicClient.readContract({
      address: MINTIFY_CONTRACT_ADDRESS,
      abi: mintifyAbi,
      functionName: "tokenUriUpdates",
      args: [walletAddress],
    });

    const nextPrice = Number(
      formatEther(
        await publicClient.readContract({
          address: MINTIFY_CONTRACT_ADDRESS,
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
      throw new RequestError(
        "Mismatch between mint status in blockchain and internal database. If you have minted NFT already, you probably selected different chain than on mint"
      );
    }

    if (!nft) {
      return NextResponse.json<NFTInfo>({
        nftStatus: NFTStatus.NotMinted,
        nextPrice,
      });
    }

    const tokenURI = await publicClient.readContract({
      address: MINTIFY_CONTRACT_ADDRESS,
      abi: mintifyAbi,
      functionName: "tokenURI",
      args: [BigInt(nft.tokenId)],
    });

    const result = await apiRequest<NFTMetadata>(tokenURI);
    if (!result.success) {
      throw new RequestError("Cannot fetch metadata successfully");
    }

    const { image } = result.data;

    const currentOwner = await publicClient.readContract({
      address: MINTIFY_CONTRACT_ADDRESS,
      abi: mintifyAbi,
      functionName: "ownerOf",
      args: [BigInt(nft.tokenId)],
    });

    if (currentOwner != user.wallet) {
      return NextResponse.json<NFTInfo>({
        nftStatus: NFTStatus.Transferred,
        image,
      });
    }

    return NextResponse.json<NFTInfo>({
      nftStatus: NFTStatus.Minted,
      image,
      nextPrice,
    });
  } catch (error) {
    console.error(error);
    return (
      handlePrismaErrors(error) ??
      handleViemErrors(error) ??
      handleCommonErrors(error)
    );
  }
}
