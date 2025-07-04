import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    dirs: ["src/app", "src/lib"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "crimson-bitter-horse-871.mypinata.cloud",
        port: "",
        pathname: "/ipfs/**",
      },
    ],
  },
};

export default nextConfig;
