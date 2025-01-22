# hardhat-resolc
Plugin for compiling Solidity Smart Contracts to PolkaVM.

**NOTE**: `resolc` is compatible with solidity versions higher than `0.8.0`.

This plugin allows for seamless transition between EVM and PolkaVM environments,
by enabling compilation of Solidity Smart Contracts to PolkaVM compatible hardhat
artifacts, in order to facilitate deployment or testing.

### Description
This plugin overrides the `compile` tasks in order to replace compiler from `solc`
to [pallet revive](https://github.com/paritytech/revive)'s `resolc`. At the same
time it allows for selecting either `remix` as the compilation backend or the
`resolc` binary, with full support for their respective optional commands.

### Requirements
When using the `resolc` binary, it's required to state the path to the binary and
fullfiling all other requirements as described by the [installation section](https://github.com/paritytech/revive?tab=readme-ov-file#installation)
of the `pallet revive` repo. If you need to compile to a solidity version different
from the `solc` you have installed, the corresponding version's binary must be
present and the path specified in the configuration.

When using the `remix` backend for compilation, the solidity version of the project
must be >= 0.8.0, since the backend is hardcoded for that compiler version.

### Configuration
Please refer to the [ResolcConfig](/packages/hardhat-resolc/src/types.ts#L9) type
to see the available configuration options, as well as the `resolc` compiler's 
`--help` section for more detailed information on each.

When using the `remix` backend for compilation, the only available configuration
options are within the `optimization` field, and are enabling or disabling the
optimization through the `enable` option and defining the number of `runs` for the
optimizer under the option with the same name.

When using the `resolc` binary, the same configuration options as when using the
binary on its own are available.

Inside of the hardhat configuration file, you must define both that the VM is `polkavm`
inside the `hardhat` network and the `resolc` options, such as the following:

```ts
const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      polkavm: true
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
```

You must also import the plugin at the top of the configuration file in order to
override the compiler.

This configuration will have hardhat interact with the chain as if with a live chain,
since the `forking` capability is not yet integrated. As a workaround, you can
fork the Asset Hub mainnet with a tool such as [`@acala-network/chopsticks`](https://github.com/AcalaNetwork/chopsticks)
and then use the [`eth-rpc-adapter`](https://contracts.polkadot.io/work-with-a-local-node#build-and-run-eth-rpc-proxy)
in order to provide the fork with the required ethereum-compatible calls.

### Compatibility
This plugin shares the same compatibility requirements as the `resolc` compiler,
such as:
- Have the [`solc`](https://github.com/ethereum/solidity) binary installed.
- Have a build of LLVM 18.1.4 or later including `compiler-rt`

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
