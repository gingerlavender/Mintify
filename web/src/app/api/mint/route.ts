import { z } from "zod";

import { createURIForUser } from "@/lib/image-generation";
import {
  getPublicClientByChainId,
  publicClientsByChainId,
} from "@/lib/public-clients";
import { assertValidAddress, assertValidConnection } from "@/lib/validation";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";
import { encodePacked, hashMessage, keccak256, parseSignature } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { NextResponse } from "next/server";
import { MintMessageWithSignature } from "@/types/mint";

const MintRequestSchema = z.object({
  type: z.union([z.literal("mint"), z.literal("remint")]),
  chainId: z.number().refine((id) => {
    return id in publicClientsByChainId;
  }),
});

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const { type, chainId } = MintRequestSchema.parse(rawBody);

    const user = await assertValidConnection();
    const walletAddress = assertValidAddress(user.wallet);
    const mintifyAddress = assertValidAddress(
      process.env.NEXT_PUBLIC_MINTIFY_ADDRESS
    );

    const publicClient = getPublicClientByChainId(chainId);

    const signer = privateKeyToAccount(
      process.env.TRUSTED_SIGNER_PRIV_KEY as `0x${string}`
    );

    const nonce = await publicClient.readContract({
      address: mintifyAddress,
      abi: mintifyAbi,
      functionName: "tokenUriUpdates",
      args: [walletAddress],
    });

    const tokenURI = createURIForUser(user);

    const message = encodePacked(
      ["address", "string", "uint256", "uint256"],
      [walletAddress, tokenURI, nonce, BigInt(chainId)]
    );

    const messageHash = keccak256(message);
    const ethSignedMessageHash = hashMessage(messageHash);

    const signature = await signer.signMessage({
      message: ethSignedMessageHash,
    });

    const { v, r, s } = parseSignature(signature);

    if (v == undefined) {
      throw new Error("Cannot retrieve v from signature");
    }

    if (type == "remint") {
    } else {
      return NextResponse.json<MintMessageWithSignature>({
        nonce: nonce.toString(),
        tokenURI,
        chainId,
        v: v.toString(),
        r,
        s,
      });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 400 }
    );
  }
}
