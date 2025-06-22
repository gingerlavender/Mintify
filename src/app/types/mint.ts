export type MintStatus = "first" | "repeated";

export interface MintStatusResponse {
  success: "true" | "false";
  mintStatus?: string;
  error?: string;
}

export interface MintStatusModalProps {
  message: string;
}
