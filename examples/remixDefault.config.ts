import { HardhatUserConfig } from "hardhat/config";
import "hardhat-resolc"

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    networks: {
        polkavm: {
            url: `http://127.0.0.1:8545`
        },
    },
    resolc: {
        compilerSource: 'remix',
        settings:
        {
            /**
             * Since we are not defining the optimization settings, they default
             * to `enabled` and `runs=200`.
             * */ 
            evmVersion: "istanbul"
        },
    },
};

export default config;
