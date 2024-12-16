import 'hardhat/types/config';
import { NodeConfig } from './types';

declare module 'hardhat/types/config' {
    interface HardhatNetworkUserConfig {
        polkavm?: boolean;
        ethNetwork?: string;
        nodeConfig?: NodeConfig;
    }

    interface HttpNetworkUserConfig {
        polkavm?: boolean;
        nodeConfig?: NodeConfig;
    }

    interface HardhatNetworkConfig {
        polkavm: boolean;
        url: string;
        nodeConfig?: NodeConfig;
    }

    interface HttpNetworkConfig {
        polkavm: boolean;
        ethNetwork?: string;
        nodeConfig?: NodeConfig;
    }
}

declare module 'hardhat/types/runtime' {
    interface Network {
        polkavm: boolean;
        nodeConfig?: NodeConfig;
    }
}
