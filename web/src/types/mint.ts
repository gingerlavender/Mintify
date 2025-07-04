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

interface MintMessage {
  tokenURI: string;
  nonce: string;
  chainId: number;
}

export type MintMessageWithSignature = MintMessage & Signature;

interface RemintMessage extends MintMessage {
  tokenId: string;
}

export type RemintMessageWithSignature = RemintMessage & Signature;
