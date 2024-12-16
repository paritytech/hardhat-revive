import { PolkaVMNodePluginError } from "./errors";
import { NodeConfig } from "./types";

export function extractNodeCommands(nodeConfig: NodeConfig | undefined): string[] | undefined {
    
    if (!nodeConfig) {
        return undefined;
    };

    const commandArgs: string[] = [];

    if (nodeConfig.rpcPort) {
        commandArgs.push(`--rpc-port=${nodeConfig.rpcPort}`);
    };

    if(nodeConfig.noTelemetry) {
        commandArgs.push(`--no-telemetry`);
    };

    if (nodeConfig.chain) {
        commandArgs.push(`--chain=${nodeConfig.chain}`);
    };

    if(nodeConfig.log) {
        let hit: boolean = false;
        let logCommands: string[] = []
        nodeConfig.log.forEach((arg) => {
            if (hit === false && arg === 'error' || arg ===  'warn' || arg === 'info' || arg ===  'debug' || arg ===  'trace' ) {
                hit = true;
            } else if ( arg === 'error' || arg ===  'warn' || arg === 'info' || arg ===  'debug' || arg ===  'trace' ) {
                throw new PolkaVMNodePluginError(`Wrong log command. You can only pass one of 'error' | 'warn' | 'info' | 'debug' | 'trace' at a time.`);
            };

            logCommands.push(arg);
        })
        commandArgs.push(`--log=${logCommands.join(' ')}`);
    };

    if(nodeConfig.detailedLogOutput) {
        commandArgs.push(`--detailed-log-output`);
    };

    if(nodeConfig.statePruning) {
        commandArgs.push(`--state-pruning=${nodeConfig.statePruning}`);
    };

    if(nodeConfig.blocksPruning) {
        commandArgs.push(`--blocks-pruning=${nodeConfig.blocksPruning}`);
    };

    if(nodeConfig.database) {
        commandArgs.push(`--database=${nodeConfig.database}`);
    };

    if(nodeConfig.dbCache) {
        commandArgs.push(`--db-cache=${nodeConfig.dbCache}`);
    };

    if(nodeConfig.bootnodes) {
        commandArgs.push(`--bootnodes=${nodeConfig.bootnodes.join(' ')}`);
    };

    if(nodeConfig.port) {
        commandArgs.push(`--port=${nodeConfig.port}`);
    };

    if(nodeConfig.sync) {
        commandArgs.push(`--sync=${nodeConfig.sync}`);
    };

    if(nodeConfig.networkBackend) {
        commandArgs.push(`--network-backend=${nodeConfig.networkBackend}`);
    };

    if(nodeConfig.tmp) {
        commandArgs.push(`--tmp`);
    };

    return commandArgs;
}
