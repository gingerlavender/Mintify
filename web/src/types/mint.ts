import { publicClients } from "@/lib/public-clients";
import { Hex } from "viem";

export type ChainId = keyof typeof publicClients;

export const MINT_ACTIONS = ["mint", "remint"] as const;
export type MintAction = (typeof MINT_ACTIONS)[number];

export type MintStatus = "not_minted" | "minted" | "token_transferred";

export type MintStatusInfo =
  | {
      mintStatus: "not_minted";
      nextPrice: number;
    }
  | {
      mintStatus: "minted";
      tokenURI: string;
      nextPrice: number;
    }
  | {
      mintStatus: "token_transferred";
      tokenURI: string;
    };

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
