import 'hardhat/types/config';

declare module 'hardhat/types/config' {
    interface HardhatNetworkUserConfig {
        polkavm?: boolean;
        nodePath?: string,
        adapterPath?: string,
    }

    interface HttpNetworkUserConfig {
        polkavm?: boolean;
    }

    interface HardhatNetworkConfig {
        polkavm: boolean;
        url: string;
    }

    interface HttpNetworkConfig {
        polkavm: boolean;
        ethNetwork?: string;
    }
}

declare module 'hardhat/types/runtime' {
    interface Network {
        polkavm: boolean;
    }
}
