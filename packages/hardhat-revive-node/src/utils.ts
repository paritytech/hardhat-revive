import axios from 'axios';
import net from 'net';
import { createProvider } from 'hardhat/internal/core/providers/construction';
import { HardhatConfig } from 'hardhat/types';

import {
    BASE_URL,
    MAX_PORT_ATTEMPTS,
    NETWORK_ACCOUNTS,
    NETWORK_ETH,
    NETWORK_GAS,
    NETWORK_GAS_PRICE,
    CHOPSTICKS_START_PORT,
    ETH_RPC_ADAPTER_START_PORT,
    POLKAVM_TEST_NODE_NETWORK_NAME,
    BASE_WS,
} from './constants';
import { PolkaVMNodePluginError } from './errors';
import { CommandArguments, SplitCommands } from './types';
import { JsonRpcServer } from './server';

// Generates command arguments for running the era-test-node binary
export function constructCommandArgs(args: CommandArguments): SplitCommands {
    const nodeCommands: string[] = [];
    const adapterCommands: string[] | undefined = [];

    if (args.fork) {
        nodeCommands.push(`npx @acala-network/chopsticks@latest`);

        if (args.forkBlockNumber) {
            nodeCommands.push(`--block=${args.forkBlockNumber}`);
        }
    } else if (args.nodeBinaryPath){
        nodeCommands.push(args.nodeBinaryPath);
    } else {
        throw new PolkaVMNodePluginError('Binary path not specified.');
    }

    if (args.endpoint) {
        nodeCommands.push(`--endpoint=${args.endpoint}`);
    } else {
        throw new PolkaVMNodePluginError('Endpoint not defined.');
    }

    if (args.port) {
        nodeCommands.push(`--port=${args.port}`);
    }

    if (args.adapterBinaryPath) {
        adapterCommands.push(args.adapterBinaryPath);
    }

    if (args.adapterEndpoint) {
        adapterCommands.push(`--node-rpc-url=${args.adapterEndpoint}`);
    }

    if (args.adapterPort) {
        adapterCommands.push(`--rpc-port=${args.adapterPort}`);
    }

    if (args.dev) {
        adapterCommands.push('-- --dev');
    }

    return {
        nodeCommands,
        adapterCommands
    };
}

async function isPortAvailableForIP(port: number, ip: string): Promise<boolean> {
    return new Promise((resolve) => {
        const tester: net.Server = net
            .createServer()
            .once('error', (err: any) => resolve(err.code !== 'EADDRINUSE'))
            .once('listening', () => tester.close(() => resolve(true)))
            .listen(port, ip);
    });
}

export async function isPortAvailable(port: number): Promise<boolean> {
    const availableIPv4 = await isPortAvailableForIP(port, '0.0.0.0');
    const availableIPv6 = await isPortAvailableForIP(port, '::');
    return availableIPv4 && availableIPv6;
}

export async function waitForNodeToBeReady(port: number, maxAttempts: number = 20): Promise<void> {
    const rpcEndpoint = `http://127.0.0.1:${port}`;

    const payload = {
        jsonrpc: '2.0',
        method: 'eth_chainId',
        params: [],
        id: new Date().getTime(),
    };

    let attempts = 0;
    let waitTime = 1000; // Initial wait time in milliseconds
    const backoffFactor = 2;
    const maxWaitTime = 30000; // Maximum wait time (e.g., 30 seconds)

    while (attempts < maxAttempts) {
        try {
            const response = await axios.post(rpcEndpoint, payload);

            if (response.data && response.data.result) {
                return; // The node responded with a valid chain ID
            }
        } catch (e: any) {
            // console.error(`Attempt ${attempts + 1} failed with error:`, e.message);
            // If it fails, it will just try again
        }

        attempts++;

        // Wait before the next attempt
        await new Promise((r) => setTimeout(r, waitTime));

        // Update the wait time for the next attempt
        waitTime = Math.min(waitTime * backoffFactor, maxWaitTime);
    }

    throw new PolkaVMNodePluginError("Server didn't respond after multiple attempts");
}

export async function getAvailablePort(startPort: number, maxAttempts: number): Promise<number> {
    let currentPort = startPort;
    for (let i = 0; i < maxAttempts; i++) {
        if (await isPortAvailable(currentPort)) {
            return currentPort;
        }
        currentPort++;
    }
    throw new PolkaVMNodePluginError("Couldn't find an available port after several attempts");
}

export function adjustTaskArgsForPort(taskArgs: string[], currentPort: number): string[] {
    const portArg = '--port';
    const portArgIndex = taskArgs.indexOf(portArg);
    if (portArgIndex !== -1) {
        if (portArgIndex + 1 < taskArgs.length) {
            taskArgs[portArgIndex + 1] = `${currentPort}`;
        } else {
            throw new PolkaVMNodePluginError('Invalid task arguments: --port provided without a following port number.');
        }
    } else {
        taskArgs.push(portArg, `${currentPort}`);
    }
    return taskArgs;
}

export function getNetworkConfig(url: string) {
    return {
        accounts: NETWORK_ACCOUNTS.REMOTE,
        gas: NETWORK_GAS.AUTO,
        gasPrice: NETWORK_GAS_PRICE.AUTO,
        gasMultiplier: 1,
        httpHeaders: {},
        timeout: 20000,
        url,
        ethNetwork: NETWORK_ETH.LOCALHOST,
        chainId: 420420421,
    };
}

export async function configureNetwork(config: HardhatConfig, network: any, port: number) {
    const url = `${BASE_URL}:${port}`;

    network.name = POLKAVM_TEST_NODE_NETWORK_NAME;
    network.config = getNetworkConfig(url);
    config.networks[network.name] = network.config;
    network.provider = await createProvider(config, network.name);
}

export async function startServer(nodePath?: string, adapterPath?: string ) {

    const currentNodePort = await getAvailablePort(CHOPSTICKS_START_PORT, MAX_PORT_ATTEMPTS);
    const currentAdapterPort = await getAvailablePort(ETH_RPC_ADAPTER_START_PORT, MAX_PORT_ATTEMPTS);
    const commandArgs = constructCommandArgs({ port: currentNodePort, adapterPort: currentAdapterPort });

    return {
        commandArgs,
        server: new JsonRpcServer(nodePath, adapterPath),
        port: currentAdapterPort,
    };
};
