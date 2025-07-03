export enum MintStatus {
  NotMinted,
  Minted,
  TokenTransferred,
}

export type MintStatusResult =
  | {
      mintStatus: MintStatus.NotMinted;
      nextPrice: bigint;
    }
  | {
      mintStatus: MintStatus.Minted;
      tokenURI: string;
      nextPrice: bigint;
    }
  | {
      mintStatus: MintStatus.TokenTransferred;
      tokenURI: string;
    };
