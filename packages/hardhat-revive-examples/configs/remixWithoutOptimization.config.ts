import { HardhatUserConfig } from "hardhat/config";
import "hardhat-resolc/src/index"

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    polkavm: {
      url: `http://127.0.0.1:8545`
    },
  },
  resolc: {
    compilerSource: 'remix',
    settings: {
      optimizer: {
        enabled: false,
      },
      evmVersion: "istanbul"
    },
  },
};