export type MintStatus = "first" | "repeated" | "transferred";

export type MintStatusResult =
  | {
      mintStatus: "first";
    }
  | {
      mintStatus: "repeated";
      tokenURI: string;
    };
