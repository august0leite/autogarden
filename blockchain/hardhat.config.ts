import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { configVariable, defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  paths: {
    tests: "./test",
    sources: "./contracts",
  },
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
    settings: {
      excludePaths: [
        "contracts/**/*.t.sol",
        "contracts/**/*.invariants.t.sol",
      ],
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      url: "https://eth-sepolia.g.alchemy.com/v2/a_M4dDUnQmGmATzjZ__FW",
      accounts: ["530dd3f3eb4eb739737b4a9179b5e4236a02703958808f9ff7e3b281cc6185d4"],
    },
  },
    verify: {
    etherscan: {
      apiKey: "UZM8RX9T9U9FEF9JRKDU72TIG1ZUV6CE2E",
    },
  },
});
