export const isMobile = () =>
  typeof window !== "undefined" &&
  /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

export const metamaskDeepLink = () => {
  const hostname = window?.location?.hostname ?? "";
  return `https://metamask.app.link/dapp/${hostname}`;
};

export const isMetaMaskBrowser = () => {
  return (
    typeof window !== "undefined" &&
    (window.ethereum?.isMetaMask || false) &&
    /MetaMask/i.test(navigator.userAgent)
  );
};
