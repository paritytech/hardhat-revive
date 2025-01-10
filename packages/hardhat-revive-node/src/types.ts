export interface CommandArguments {
    fork?: string;
    forkBlockNumber?: number;
    nodeBinaryPath?: string;
    endpoint?: string;
    port?: number;
    adapterBinaryPath?: string;
    adapterEndpoint?: string;
    adapterPort?: number;
    dev?: boolean;
}

export interface RpcServer {
    listen(chopsticksArgs?: string[],adapterArgs?: string[], blockProcess?: boolean): Promise<void>;
    stop(): Promise<void>;
}

export interface SplitCommands {
    nodeCommands: string[];
    adapterCommands?: string[];
}