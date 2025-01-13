# hardhat-revive-node
Plugin for running an in-memory PolkaVM node.

### Description
This plugin enables the usage of a local instance of the PolkaVM node for testing,
as well as the usage of the `hardhat` network's `forkin` option to fork a live
chain using `@acala-network/chopsticks` and use the Polkadot-SDK `eth-rpc-adapter`
to enable local testing.

### Requirements
Both when connecting to a live chain endpoint and when forking one, it is required that the
path to the `eth-rpc-adapter` binary is specified, unless the endpoint you are
connecting to is Ethereum compatible, otherwise all the calls will fail.

The version of the `eth-rpc-adapter` binary must be compatible with the runtime
of the chain you are connecting to, else you will receive the following error:
```bash
Metadata error: The generated code is not compatible with the node
```
As of 14/01/2025, that version can be built from the Polkadot-SDK's [`stable2412`
branch](https://github.com/paritytech/polkadot-sdk/tree/stable2412).

### Configuration
Pleaser refer to the [CommandArguments](/packages/hardhat-revive-node/src/types.ts#L15)
type to see the available configuration options.

Inside of the hardhat configuration file, you must define both the `polkavm` network
and the `hardhat` options, such as the following:

```ts
const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      polkavm: true,
      forking: {
        url: 'wss://westend-asset-hub-rpc.polkadot.io',
      },
      adapterConfig: {
        adapterBinaryPath: '../../polkadot-sdk/target/release/eth-rpc',
        dev: true
      }
    },
    polkavm: {
      url: `http://127.0.0.1:8545`
    },
  }
};
```

In this example, since we are forking a live chain, we do not need to specify the
node binary path.

### Compatibility
Regarding `hardhat` compatibility, since it's set as part of the `hardhat`
type in the `NetworksConfig` type, it is not compatible with hardhat-only helpers,
such as `time` and `loadFixture` from `@nomicfoundation/hardhat-toolbox/network-helpers`.

Further compatibility limitations have not been found at this point.
