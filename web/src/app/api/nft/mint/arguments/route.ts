import { z } from "zod";
import { NextResponse } from "next/server";
import { encodePacked, Hex, keccak256, parseSignature } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { prisma } from "@/lib/prisma-client";
import { publicClients } from "@/lib/viem/public-clients";
import { generateAndUploadSpotifyBasedMetadata } from "@/lib/nft/metadata/manage-nft-metadata";
import {
  claimMintArgsRequest,
  cleanupMintArgsRequest,
} from "@/lib/nft/mint/arguments-request";
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

const MintArgumentsRequestSchema = z.object({
  action: z.nativeEnum(MintAction, {}),
  chainId: z.number().refine((id): id is ChainId => id in publicClients, {
    message: "Invalid chain id",
  }),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const { action, chainId } = MintArgumentsRequestSchema.parse(rawBody);

    const user = await assertValidConnection();
    const walletAddress = assertValidAddress(user.wallet);

    const publicClient = publicClients[chainId]!;

    const signer = privateKeyToAccount(
      process.env.TRUSTED_SIGNER_PRIV_KEY as Hex
    );

    let message: Hex;
    let tokenId: string | undefined = undefined;
    let tokenURI: string;

    const nonce = await publicClient.readContract({
      address: MINTIFY_CONTRACT_ADDRESS,
      abi: mintifyAbi,
      functionName: "tokenUriUpdates",
      args: [walletAddress],
    });

    const nft = await prisma.personalNFT.findUnique({
      where: {
        userId: user.id,
      },
    });

    await claimMintArgsRequest(user);

    try {
      if (action === MintAction.Remint) {
        if (!nft) {
          throw new PermissionError("You cannot remint before initial mint");
        }

        tokenId = nft.tokenId;
        tokenURI = await generateAndUploadSpotifyBasedMetadata(user);

        message = encodePacked(
          ["uint256", "string", "uint256", "uint256"],
          [BigInt(tokenId), tokenURI, nonce, BigInt(chainId)]
        );
      } else {
        if (nft) {
          throw new PermissionError("You cannot mint more than once");
        }

        tokenURI = await generateAndUploadSpotifyBasedMetadata(user);

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

      return NextResponse.json<MintArgsWithSignature | RemintArgsWithSignature>(
        {
          tokenURI,
          v: Number(v),
          r,
          s,
          ...(tokenId ? { tokenId } : {}),
        }
      );
    } catch (error) {
      await cleanupMintArgsRequest(user);
      throw error;
    }
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
