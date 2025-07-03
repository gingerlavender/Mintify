export enum MintStatus {
  NotMinted,
  Minted,
  TokenTransferred,
}

export type MintStatusResult =
  | {
      mintStatus: MintStatus.NotMinted;
      nextPrice: number;
    }
  | {
      mintStatus: MintStatus.Minted;
      tokenURI: string;
      nextPrice: number;
    }
  | {
      mintStatus: MintStatus.TokenTransferred;
      tokenURI: string;
    };
