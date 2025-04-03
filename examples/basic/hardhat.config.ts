import 'hardhat-resolc';

const config = {
    solidity: "0.8.28",
    resolc: {
        version: '1.5.2',
        compilerSource: 'remix',
        settings: {
        optimizer: {
            enabled: false,
            runs: 600,
        },
        evmVersion: 'istanbul',
        },
    },
    networks: {
        hardhat: {
            polkavm: true,
          },
    },
};

export default config;