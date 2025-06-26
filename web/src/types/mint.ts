export type MintStatus = "first" | "repeated";

export type MintStatusResult =
  | {
      mintStatus: "first";
    }
  | {
      mintStatus: "repeated";
      tokenURI: string;
    };

export type MintStatusError = {
  error: string;
};

export type MintStatusResponse = MintStatusResult | MintStatusError;
