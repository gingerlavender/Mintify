import { publicClients } from "@/lib/public-clients";

export type ChainId = keyof typeof publicClients;

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
  v: string;
  r: `0x${string}`;
  s: `0x${string}`;
}

interface MintArgs {
  tokenURI: string;
}

export type MintArgsWithSignature = MintArgs & Signature;

interface RemintArgs extends MintArgs {
  tokenId: string;
}

export type RemintArgsWithSignature = RemintArgs & Signature;
