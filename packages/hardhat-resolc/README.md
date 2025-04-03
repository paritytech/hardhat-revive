# hardhat-resolc
Polkadot Hub [Hardhat](https://hardhat.org/) plugin to compile Ethereum-compatible solidity smart contracts.

### Compatibility

- Not compatible with solidity versions lower than `0.8.0`.

## Getting Started

### Installation

```bash
npm install -D @paritytech/hardhat-polkadot-solc  # npm
yarn add -D @paritytech/hardhat-polkadot-solc     # yarn
```

### Configuration

1. Import the package in the hardhat.config.ts file:

```js
...
import "@matterlabs/hardhat-polkadot-solc";
...
```

2. Configure resolc in hardhat.config.ts according to [available options](https://github.com/paritytech/hardhat-revive/blob/797d2fe397e48e4815085f3d0dbf2bc653f9353a/packages/hardhat-resolc/src/types.ts#L9).

## Happy building! 👷‍♀️👷‍♂️