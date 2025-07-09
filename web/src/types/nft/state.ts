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
      tokenId: string;
      image: string;
      nextPrice: number;
    }
  | {
      nftStatus: NFTStatus.Transferred;
      tokenId: string;
      image: string;
    };
