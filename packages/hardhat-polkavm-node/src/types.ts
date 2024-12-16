export interface NodeConfig {
    // Path to the Revive Node binary.
    nodeBinaryPath?: string;
    // Path to the Eth RPC Adapter binary.
    rpcAdapterBinaryPath?: string;
    // Specify JSON-RPC server TCP port.
    rpcPort?: number;
    // Disable connecting to the Substrate telemetry server.
    noTelemetry?: boolean;
    // Specify the chain specification.
    // It can be one of the predefined ones (dev, local, or staging) or it
    // can be a path to a file with the chainspec (such as one exported by
    // the `build-spec` subcommand).
    chain?: string;
    // Sets a custom logging filter. Log levels are set from least to most verbose.
    log?: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    // Enable detailed log output. Includes displaying the log target, log level and thread name.
    // This is automatically enabled when something is logged with any higher level than `info`.
    detailedLogOutput?: boolean;
    // This mode specifies when the block's state (ie, storage) should be pruned (ie, removed) from the database.
    statePruning?: 'archive' | 'archive-cannonical' | number;
    // This mode specifies when the block's body (including justifications) should be pruned (ie, removed) from the database.
    blocksPruning?: 'archive' | 'archive-cannonical' | number;
    // Select database backend to use.
    database?: 'rocksdb' | 'paritydb' | 'auto' | 'paritydb-experimental';
    // Limit in MiB the memory the database cache can use.
    dbCache?: number;
    // Specify a list of bootnodes.
    bootnodes?: string[];
    // Specify p2p protocol TCP port.
    port?: number;
    //  Blockchain syncing mode.
    sync?: 'full' | 'fast' | 'warp' | 'fast-unsafe';
    // Network backend used for P2P networking.
    networkBackend?: 'libp2p' | 'litep2p';
    // Run a temporary node. A temporary directory will be created to store the configuration and will be deleted at the end of the process.
    tmp?: boolean
}