export const checkMintStatus = async (address: string) => {
  const resp = await fetch("api/mint/status", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ walletAddress: address }),
  });
  const data = await resp.json();
  return data;
};
