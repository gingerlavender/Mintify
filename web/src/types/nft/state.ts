export enum NFTStatus {
  NotMinted = "NOT_MINTED",
  Minted = "MINTED",
  Transferred = "TRANSFERRED",
}

export type NFTInfo =
  | {
      nftStatus: NFTStatus.NotMinted;
      nextPrice: number;
    }
  | {
      nftStatus: NFTStatus.Minted;
      image: string;
      nextPrice: number;
    }
  | {
      nftStatus: NFTStatus.Transferred;
      image: string;
    };
