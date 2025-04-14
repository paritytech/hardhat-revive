# hardhat-polkadot-resolc
Polkadot [Hardhat](https://hardhat.org/) plugin to compile Ethereum-compatible solidity smart contracts.

### Compatibility

- Not compatible with solidity versions lower than `0.8.0`.

## Getting Started

### Installation

```bash
npm install -D @parity/hardhat-polkadot-resolc  # npm
yarn add -D @parity/hardhat-polkadot-resolc     # yarn
```

### Configuration

1. Import the package in the hardhat.config.ts file:

```js
...
import "@parity/hardhat-polkadot-resolc";
...
```

2. Configure resolc in hardhat.config.ts according to [available options](https://github.com/paritytech/hardhat-revive/blob/797d2fe397e48e4815085f3d0dbf2bc653f9353a/packages/hardhat-resolc/src/types.ts#L9).

## Happy building! 👷‍♀️👷‍♂️