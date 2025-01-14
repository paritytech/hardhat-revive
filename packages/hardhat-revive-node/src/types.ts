import { HardhatNetworkForkingUserConfig } from "hardhat/types";

export interface NodeConfig {
    nodeBinaryPath?: string;
    port?: number;
}

export interface AdapterConfig {
    adapterBinaryPath?: string;
    adapterEndpoint?: string;
    adapterPort?: number;
    dev?: boolean;
    buildBlockMode?: 'Instant' | 'Manual' | 'Batch';
}

export interface CommandArguments {
    forking?: HardhatNetworkForkingUserConfig;
    forkBlockNumber?: number;
    nodeCommands?: NodeConfig;
    adapterCommands?: AdapterConfig;
}

export interface RpcServer {
    listen(chopsticksArgs?: string[],adapterArgs?: string[], blockProcess?: boolean): Promise<void>;
    stop(): Promise<void>;
}

export interface SplitCommands {
    nodeCommands: string[];
    adapterCommands?: string[];
}
