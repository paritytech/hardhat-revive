# hardhat-revive-node
Plugin for running a mock in-memory PolkaVM node.

### Description
This plugin enables the usage of a local instance of the PolkaVM node for testing,
as well as the usage of the `hardhat` network's `forking` option to fork a live
chain using `@acala-network/chopsticks` and use the Polkadot-SDK `eth-rpc-adapter`
to enable local testing.

### Requirements
In order to use the plugin, it must be imported at the top of the `hardhat.config`
file, in order to override the relevant `hardhat` tasks.

Both when connecting to a live chain endpoint and when forking one, it is required that the
path to the `eth-rpc-adapter` binary is specified, unless the endpoint you are
connecting to is Ethereum compatible, otherwise all the calls will fail.

The version of the `eth-rpc-adapter` binary must be compatible with the runtime
of the chain you are connecting to, else you will receive the following error:
```bash
Metadata error: The generated code is not compatible with the node
```

### Configuration of standalone node
We can run the node locally as either a fork of a live chain or using local binaries.

```bash
npx hardhat node-polkavm --fork wss://asset-hub-westend-rpc.dwellir.com 
\ --build-block-mode Instant
\ --adapter-binary-path /path/to/adapter 
\ --dev
```

When connecting to a live chain to use the `--fork` command or when running a local
node you need to have the `eth-rpc-adapter` binary present and it's path defined
in the `--adapter-binary-path`. When running the node standalone, you must either
define the chain to fork or provide a binary path to the run the local node.

Pleaser refer to the [CliCommands](/packages/hardhat-revive-node/src/types.ts#L3)
type to see the available configuration options.

| 🔧 Command                          | 📄 Description                                                                                                       |
|-------------------------------------|----------------------------------------------------------------------------------------------------------------------|
| --rpc-port                          | Port on which the server should listen. Defaults to 8000.                                                            |
| --node-binary-path                  | Path to the substrate node binary.                                                                                   |
| --adapter-endpoint                  | Endpoint to which the adapter will connect to. Defaults to ws://localhost:8000.                                      |
| --adapter-binary-path               | Path to the eth-rpc-adapter binary.                                                                                  |
| --adapter-port                      | Port on which the adapter will listen to. Defaults to 8545.                                                          |
| --dev                               | Whether to run the fork in dev mode. Defaults to false.                                                              |
| --build-block-mode                  | Build block mode for chopsticks.                                                                                     |
| --fork                              | Endpoint of the chain to fork.                                                                                       |
| --fork-block-number                 | Block hash or block number from where to fork.                                                                       |

**NOTE**
Usage of absolute paths are recommended.

### Configuration for testing
When used for testing you have two options, either provide the configuration inside
the `hardhat.config.{ts,js}` file or
provide the configuration through the cli arguments defined in the previous section.

To run the node you can run the node with:
```bash
npx hardhat node
```
Having specified previously `polkavm: true` in the config file, or just run:
```bash
npx hardhat node-polkavm
```
Which will also initiate the node.

You will encounter this error with tests that
use certain helpers:
```bash
OnlyHardhatNetworkError: This helper can only be used with Hardhat Network. You are connected to 'localhost'.
```

Until now there's no way to avoid this, since there are certain rpc calls that are
required to comply with `hardhat`'s network spec and are not present yet in the node.

As long as `polkavm` is set to `true`, you can also run the tests directly using:
```bash
npx hardhat test
```
Which will start the node in a separate process and run the tests against it.

When using the `config` field, you must define the `hardhat` options, such as the following:

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
  }
};
```

In this example, since we are forking a live chain, we do not need to specify the
node binary path.

Pleaser refer to the [CommandArguments](/packages/hardhat-revive-node/src/types.ts#L28)
type to see the available configuration options.

### Compatibility
Regarding `hardhat` compatibility, even though it's set as part of the `hardhat`
type in the `NetworksConfig` type, it is not compatible with hardhat-only helpers,
such as `time` and `loadFixture` from `@nomicfoundation/hardhat-toolbox/network-helpers`,
due to the node missing some rpc calls necessary for these calls to work.

When running against a local node, or against a fork of the live chain, you must
make sure that the binaries employed are compatible with eachother. In order to
do this, you can check inside pallet revive's [`Cargo.toml`](https://github.com/paritytech/revive/blob/fe1b3258d2956e51e2edd86f2e77898e6b142729/Cargo.toml#L76)
in order to see which commit of the polkadot-sdk you should use to build the
`substrate-node` and `eth-rpc-adapter` binaries. If there is a missmatch betwween
these versions, deployment will fail with `CodeRejected` or `Metadata error: The generated code is not compatible with the node`.

Further compatibility limitations have not been found at this point.
