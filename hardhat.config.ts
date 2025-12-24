import "@nomicfoundation/hardhat-ignition";
import hardhatIgnitionPlugin from "@nomicfoundation/hardhat-ignition";
import { defineConfig } from "hardhat/config";

export default defineConfig({
  solidity: {
    version: "0.8.28",
  },
  plugins: [hardhatIgnitionPlugin],
});
