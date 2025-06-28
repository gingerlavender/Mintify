export type MintStatus = "first" | "repeated";

export type MintStatusResult =
  | {
      mintStatus: "first";
    }
  | {
      mintStatus: "repeated";
      tokenURI: string;
    };
