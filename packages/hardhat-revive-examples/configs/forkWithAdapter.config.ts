import { HardhatUserConfig } from "hardhat/config";
import 'hardhat-resolc';
import "hardhat-revive-node"

const config: HardhatUserConfig = {
  solidity: "0.8.26",
  networks: {
    hardhat: {
      polkavm: true,
      forking: {
        url: 'wss://westend-asset-hub-rpc.polkadot.io',
      },
      accounts: [{
        privateKey: 'PRIVATE_KEY',
        balance: '10000000000'
      }],
      adapterConfig: {
        adapterBinaryPath: 'path/to/adapter/binary',
        dev: true
      }
    },
    polkavm: {
      url: `http://127.0.0.1:8545`
    },
  },
  resolc: {
    compilerSource: 'remix',
    settings: {
      optimizer: {
        enabled: true,
        runs: 400
      },
      evmVersion: "istanbul"
    },
  },
};

export default config;
