export const PLUGIN_NAME = 'hardhat-revive-node';

export const TASK_NODE_POLKAVM = 'node-polkavm';
export const TASK_NODE_POLKAVM_CREATE_SERVER = 'node-polkavm:create-server';
export const TASK_NODE_POLKAVM_CREATE_ETH_ADAPTER = 'node-polkavm:create-eth-adapter';
export const TASK_RUN_POLKAVM_NODE_IN_SEPARATE_PROCESS = 'node-polkavm:run-in-separate-process';

export const PROCESS_TERMINATION_SIGNALS = ['SIGINT', 'SIGTERM', 'SIGKILL'];

export const CHOPSTICKS_START_PORT = 8000;
export const ETH_RPC_ADAPTER_START_PORT = 8545;
export const MAX_PORT_ATTEMPTS = 10;
export const PORT_CHECK_DELAY = 500;
export const RPC_ENDPOINT_PATH = 'eth_chainId';

export const POLKAVM_TEST_NODE_NETWORK_NAME = 'KitchensinkNode';

export const BASE_URL = `http://127.0.0.1`;
export const NETWORK_ACCOUNTS = {
    REMOTE: 'remote',
};
export const NETWORK_GAS = {
    AUTO: 'auto',
};
export const NETWORK_GAS_PRICE = {
    AUTO: 'auto',
};
export const NETWORK_ETH = {
    LOCALHOST: 'localhost',
};

export const DEFAULT_TIMEOUT_MILISECONDS = 30000;
