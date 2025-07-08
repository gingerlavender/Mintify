import { z } from "zod";
import { NextResponse } from "next/server";
import { encodePacked, keccak256, parseSignature } from "viem";
import { privateKeyToAccount } from "viem/accounts";

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
} from "@/lib/api/error-handling";

import { mintifyAbi } from "@/generated/wagmi/mintifyAbi";

import { ChainId, MintArgsWithSignature } from "@/types/mint";

const MintRequestSchema = z.object({
  type: z.string().refine((val) => val === "mint" || val === "remint", {
    message: "Invalid action type",
  }),
  chainId: z.number().refine((id): id is ChainId => id in publicClients, {
    message: "Invalid chain id",
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

    const publicClient = publicClients[chainId]!;

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

    const signature = await signer.signMessage({
      message: { raw: messageHash },
    });

    const { v, r, s } = parseSignature(signature);

    if (v === undefined) {
      throw new Error("Cannot retrieve v from signature");
    }

    if (type === "remint") {
    } else {
      return NextResponse.json<MintArgsWithSignature>({
        tokenURI,
        v: v.toString(),
        r,
        s,
      });
    }
  } catch (error) {
    console.error(error);
    return (
      handleDatabaseErrors(error) ??
      handleContractErrors(error) ??
      handleCommonErrors(error)
    );
  }
}
