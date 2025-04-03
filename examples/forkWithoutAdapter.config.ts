import { HardhatUserConfig } from "hardhat/config";
import 'hardhat-resolc';
import "hardhat-revive-node"

const config: HardhatUserConfig = {
  solidity: "0.8.26",
  networks: {
    hardhat: {
      polkavm: true,
      forking: {
        url: 'https://westend-asset-hub-eth-rpc.polkadot.io',
      },
      accounts: [{
        privateKey: 'PRIVATE_KEY',
        balance: '10000000000'
      }],
      adapterConfig: {
        adapterBinaryPath: 'path/to/adapter/binary',
        dev: true
      },
      nodeConfig: {
        nodeBinaryPath: 'path/to/substrate/node',
        rpcPort: 8545
      }
    }
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
