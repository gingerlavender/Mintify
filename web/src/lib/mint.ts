import { MintStatusResult } from "@/types/mint";

export const getMintStatus = async (
  address: string
): Promise<MintStatusResult> => {
  const resp = await fetch("api/mint/status", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ walletAddress: address }),
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data.error || resp.statusText);
  }

  return data;
};
