import { z } from "zod";
import { NextResponse } from "next/server";
import { encodePacked, Hex, keccak256, parseSignature } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { prisma } from "@/lib/prisma";
import { createURIForUser } from "@/lib/image-generation";
import { publicClients } from "@/lib/public-clients";
import {
  assertValidAddress,
  assertValidConnection,
} from "@/lib/api/validation";
import {
  handleCommonErrors,
  handleContractErrors,
  handleDatabaseErrors,
  PermissionError,
} from "@/lib/api/error-handling";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

import {
  ChainId,
  MINT_ACTIONS,
  MintArgsWithSignature,
  RemintArgsWithSignature,
} from "@/types/mint";

const MintRequestSchema = z.object({
  action: z.enum(MINT_ACTIONS),
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
    const mintifyAddress = assertValidAddress(
      process.env.NEXT_PUBLIC_MINTIFY_ADDRESS
    );

    const publicClient = publicClients[chainId]!;

    const signer = privateKeyToAccount(
      process.env.TRUSTED_SIGNER_PRIV_KEY as Hex
    );

    const nonce = await publicClient.readContract({
      address: mintifyAddress,
      abi: mintifyAbi,
      functionName: "tokenUriUpdates",
      args: [walletAddress],
    });

    const tokenURI = createURIForUser(user);

    let message: Hex;
    let tokenId: string | undefined = undefined;

    if (action === "remint") {
      const nft = await prisma.personalNFT.findUnique({
        where: {
          userId: user.id,
        },
      });

      if (!nft) {
        throw new PermissionError("You cannot remint before initial mint");
      }

      tokenId = nft.tokenId;

      message = encodePacked(
        ["uint256", "string", "uint256", "uint256"],
        [BigInt(tokenId), tokenURI, nonce, BigInt(chainId)]
      );
    } else {
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
      handleDatabaseErrors(error) ??
      handleContractErrors(error) ??
      handleCommonErrors(error)
    );
  }
}
