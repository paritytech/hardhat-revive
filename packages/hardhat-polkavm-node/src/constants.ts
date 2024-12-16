export const PLUGIN_NAME = 'hardhat-polkavm-node';

export const TASK_RUN_NODE_POLKAVM = 'node-polkavm';
export const TASK_RUN_NODE_POLKAVM_SERVER = 'node-polkavm:create-server';
export const TASK_RUN_NODE_POLKAVM_ETH_RPC_ADAPTER = 'node-polkavm:create-rpc-adapter';

export const TASK_NODE_POLKAVM_CREATE_SERVER = 'node-polkavm:create-server';
export const TASK_RUN_NODE_POLKAVM_IN_SEPARATE_PROCESS = 'node-polkavm:run-in-separate-process';
export const TASK_NODE_POLKAVM_CREATE_ETH_RPC_ADAPTER = 'node-polkavm:create-eth-rpc-adapter';

export const PROCESS_TERMINATION_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGKILL'];

export const ALLOWED_FORK_VALUES = ['testnet', 'mainnet'];

export const PLATFORM_MAP: Record<string, string> = {
    darwin: 'apple-darwin',
    linux: 'unknown-linux-gnu', 
    win32: 'windows',
};

export const TEMP_FILE_PREFIX = 'tmp-';

export const START_PORT = 8545;
export const MAX_PORT_ATTEMPTS = 10;
export const PORT_CHECK_DELAY = 500;
export const RPC_ENDPOINT_PATH = 'eth_chainId';

export const BASE_URL = `http://127.0.0.1`;

export const DEFAULT_TIMEOUT_MILISECONDS = 30000;
