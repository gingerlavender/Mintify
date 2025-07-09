import { publicClients } from "@/lib/viem/public-clients";
import { Hex } from "viem";

export type ChainId = keyof typeof publicClients;

export enum MintAction {
  Mint = "MINT",
  Remint = "REMINT",
}

interface Signature {
  v: number;
  r: Hex;
  s: Hex;
}

interface MintArgs {
  tokenURI: string;
}

export type MintArgsWithSignature = MintArgs & Signature;

interface RemintArgs extends MintArgs {
  tokenId: string;
}

export type RemintArgsWithSignature = RemintArgs & Signature;
