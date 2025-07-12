import { z } from "zod";
import { NextResponse } from "next/server";
import { encodePacked, Hex, keccak256, parseSignature } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { prisma } from "@/lib/prisma-client";
import { publicClients } from "@/lib/viem/public-clients";
import { createSpotifyBasedMetadata } from "@/lib/ipfs/manage-nft-metadata";
import {
  assertValidAddress,
  assertValidConnection,
} from "@/lib/api/validation";
import { MINTIFY_CONTRACT_ADDRESS } from "@/lib/constants/contracts";
import {
  handleCommonErrors,
  handleViemErrors,
  handlePrismaErrors,
  PermissionError,
  handlePinataErrors,
} from "@/lib/errors";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

import {
  ChainId,
  MintAction,
  MintArgsWithSignature,
  RemintArgsWithSignature,
} from "@/types/nft/mint";

const MintRequestSchema = z.object({
  action: z.nativeEnum(MintAction),
  chainId: z.number().refine((id): id is ChainId => id in publicClients, {
    message: "Invalid chain id",
  }),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const { action, chainId } = MintRequestSchema.parse(rawBody);

    const user = await assertValidConnection();
    const walletAddress = assertValidAddress(user.wallet);

    const publicClient = publicClients[chainId]!;

    const signer = privateKeyToAccount(
      process.env.TRUSTED_SIGNER_PRIV_KEY as Hex
    );

    const nonce = await publicClient.readContract({
      address: MINTIFY_CONTRACT_ADDRESS,
      abi: mintifyAbi,
      functionName: "tokenUriUpdates",
      args: [walletAddress],
    });

    let message: Hex;
    let tokenId: string | undefined = undefined;
    let tokenURI: string;

    if (action === MintAction.Remint) {
      const nft = await prisma.personalNFT.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!nft) {
        throw new PermissionError("You cannot remint before initial mint");
      }

      tokenId = nft.tokenId;
      tokenURI = await createSpotifyBasedMetadata(user);

      message = encodePacked(
        ["uint256", "string", "uint256", "uint256"],
        [BigInt(tokenId), tokenURI, nonce, BigInt(chainId)]
      );
    } else {
      tokenURI = await createSpotifyBasedMetadata(user);

      message = encodePacked(
        ["address", "string", "uint256", "uint256"],
        [walletAddress, tokenURI, nonce, BigInt(chainId)]
      );
    }

    const messageHash = keccak256(message);

    const signature = await signer.signMessage({
      message: { raw: messageHash },
    });

    const { v, r, s } = parseSignature(signature);

    if (v === undefined) {
      throw new Error("Cannot retrieve v from signature");
    }

    return NextResponse.json<MintArgsWithSignature | RemintArgsWithSignature>({
      tokenURI,
      v: Number(v),
      r,
      s,
      ...(tokenId ? { tokenId } : {}),
    });
  } catch (error) {
    console.error(error);
    return (
      handlePinataErrors(error) ??
      handlePrismaErrors(error) ??
      handleViemErrors(error) ??
      handleCommonErrors(error)
    );
  }
}
