import { HardhatUserConfig } from "hardhat/config";
import "hardhat-resolc"

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      polkavm: true,
    },
  },
  resolc: {
    compilerSource: 'remix',
    settings: {
      optimizer: {
        /**
         * We enable optimization and define 600 as the number of optimization runs.
         */
        enabled: true,
        runs: 600
      },
      evmVersion: "istanbul"
    },
  },
};

export default config;
