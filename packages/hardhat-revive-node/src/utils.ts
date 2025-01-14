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
} from './constants';
import { PolkaVMNodePluginError } from './errors';
import { CliCommands, CommandArguments, SplitCommands } from './types';
import { JsonRpcServer } from './server';

export function constructCommandArgs(args?: CommandArguments, cliCommands?: CliCommands): SplitCommands {
    const nodeCommands: string[] = [];
    const adapterCommands: string[] | undefined = [];

    if (cliCommands) {
        if (cliCommands.fork) {
            nodeCommands.push(`npx`);
            nodeCommands.push(`@acala-network/chopsticks@latest`);

            nodeCommands.push(`--endpoint=${cliCommands.fork}`);
        } else if (cliCommands.nodeBinaryPath) {
            nodeCommands.push(cliCommands.nodeBinaryPath);
        } else {
            throw new PolkaVMNodePluginError('Binary path not specified.');
        }

        if (cliCommands.port) {
            nodeCommands.push(`--port=${cliCommands.port}`);
        }

        if (cliCommands.adapterEndpoint) {
            adapterCommands.push(`--node-rpc-url=${cliCommands.adapterEndpoint}`);
        } else {
            adapterCommands.push(`--node-rpc-url=ws://localhost:8000`);
        }

        if (cliCommands.adapterPort) {
            adapterCommands.push(`--rpc-port=${cliCommands.adapterPort}`);
        }

        if (cliCommands?.buildBlockMode) {
            nodeCommands.push(`--build-block-mode=${cliCommands.buildBlockMode}`);
        } 
    
        if (cliCommands?.dev) {
            adapterCommands.push('--dev');
        }
    } else if (args) {
        if (args.forking) {
            nodeCommands.push(`npx`);
            nodeCommands.push(`@acala-network/chopsticks@latest`);
    
            nodeCommands.push(`--endpoint=${args.forking.url}`);   
        } else if (args.nodeCommands?.nodeBinaryPath) {
            nodeCommands.push(args.nodeCommands?.nodeBinaryPath);
        } else {
            throw new PolkaVMNodePluginError('Binary path not specified.');
        }

        if (args.nodeCommands?.port) {
            nodeCommands.push(`--port=${args.nodeCommands.port}`);
        }

        if (args.adapterCommands?.adapterEndpoint) {
            adapterCommands.push(`--node-rpc-url=${args.adapterCommands.adapterEndpoint}`);
        } else {
            adapterCommands.push(`--node-rpc-url=ws://localhost:8000`);
        }

        if (args.adapterCommands?.adapterPort) {
            adapterCommands.push(`--rpc-port=${args.adapterCommands.adapterPort}`);
        }

        if (args.adapterCommands?.buildBlockMode) {
            nodeCommands.push(`--build-block-mode=${args.adapterCommands.buildBlockMode}`);
        }

        if (args.adapterCommands?.dev) {
            adapterCommands.push('--dev');
        }
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

export async function waitForNodeToBeReady(port: number, adapter: boolean = false, maxAttempts: number = 20): Promise<void> {
    const rpcEndpoint = `http://127.0.0.1:${port}`;

    if (adapter) {
        const payload = {
            jsonrpc: '2.0',
            method: 'eth_chainId',
            params: [],
            id: 1,
        };

        let attempts = 0;
        let waitTime = 1000;
        const backoffFactor = 2;
        const maxWaitTime = 30000;

        while (attempts < maxAttempts) {
            try {
                const response = await axios.post(rpcEndpoint, payload);

                if (response.data && response.data.result) {
                    return;
                }
            } catch (e: any) {
                // If it fails, it will just try again
            }

            attempts++;

            await new Promise((r) => setTimeout(r, waitTime));

            waitTime = Math.min(waitTime * backoffFactor, maxWaitTime);
        }

        throw new PolkaVMNodePluginError("Server didn't respond after multiple attempts");
    } else {
        const payload = {
            jsonrpc: '2.0',
            method: 'state_call',
            params: ["AssetConversionApi_quote_price_tokens_for_exact_tokens", "0x0100000204320504f6faef3001000000000000000000000001"],
            id: 1,
        };

        let attempts = 0;
        let waitTime = 1000;
        const backoffFactor = 2;
        const maxWaitTime = 30000;

        while (attempts < maxAttempts) {
            try {
                const response = await axios.post(rpcEndpoint, payload);

                if (response.data && response.data.result) {
                    return;
                }
            } catch (e: any) {
            }

            attempts++;

            await new Promise((r) => setTimeout(r, waitTime));

            waitTime = Math.min(waitTime * backoffFactor, maxWaitTime);
        }

        throw new PolkaVMNodePluginError("Server didn't respond after multiple attempts");

    }

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

export async function startServer(commands: CommandArguments, nodePath?: string, adapterPath?: string) {

    const currentNodePort = await getAvailablePort(commands.nodeCommands?.port ? commands.nodeCommands.port : CHOPSTICKS_START_PORT, MAX_PORT_ATTEMPTS);
    const currentAdapterPort = await getAvailablePort(commands.adapterCommands?.adapterPort ? commands.adapterCommands.adapterPort : ETH_RPC_ADAPTER_START_PORT, MAX_PORT_ATTEMPTS);
    const updatedCommands = Object.assign({}, commands, { nodeCommands: { port: currentNodePort }, adapterCommands: { adapterPort: currentAdapterPort } })
    const commandArgs = constructCommandArgs(updatedCommands);

    return {
        commandArgs,
        server: new JsonRpcServer(nodePath, adapterPath),
        port: currentAdapterPort,
    };
};
