import { defineConfig } from "@wagmi/cli";
import { foundry } from "@wagmi/cli/plugins";

export default defineConfig({
  out: "src/generated/wagmi/mintifyAbi.ts",
  contracts: [],
  plugins: [
    foundry({
      project: "../contracts",
      include: ["Mintify.sol/**"],
      exclude: ["**/*.t.sol/**", "**/*.s.sol/**"],
    }),
  ],
});
