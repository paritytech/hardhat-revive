import { spawn } from 'child_process';
import { task, subtask, types } from 'hardhat/config';
import {
    TASK_COMPILE,
    TASK_NODE,
    TASK_RUN,
    TASK_TEST,
    TASK_TEST_GET_TEST_FILES,
    TASK_TEST_RUN_MOCHA_TESTS,
} from 'hardhat/builtin-tasks/task-names';

import { HARDHAT_NETWORK_NAME } from 'hardhat/plugins';
import { TaskArguments } from 'hardhat/types';
import path from 'path';
import {
    CHOPSTICKS_START_PORT,
    ETH_RPC_ADAPTER_START_PORT,
    MAX_PORT_ATTEMPTS,
    TASK_NODE_POLKAVM,
    TASK_NODE_POLKAVM_CREATE_SERVER,
    TASK_RUN_POLKAVM_NODE_IN_SEPARATE_PROCESS,
} from './constants';
import { JsonRpcServer } from './server';
import {
    adjustTaskArgsForPort,
    configureNetwork,
    constructCommandArgs,
    getAvailablePort,
    waitForNodeToBeReady,
} from './utils';
import { PolkaVMNodePluginError } from './errors';
import { interceptAndWrapTasksWithNode } from './core/global-interceptor';
import { runScriptWithHardhat } from './core/script-runner';
import { RpcServer } from './types';

task(TASK_RUN).setAction(async (args, hre, runSuper) => {
    if (!hre.network.polkavm || hre.network.name !== HARDHAT_NETWORK_NAME) {
        await runSuper(args, hre);
        return;
    }

    await runScriptWithHardhat(hre.hardhatArguments, path.resolve(args.script));
});

// Subtask to create the server
subtask(TASK_NODE_POLKAVM_CREATE_SERVER, 'Creates a JSON-RPC server for PolkaVM node')
    .setAction(
        async (
            _args,
            hre,
        ) => {
            // Create the server
            const server: JsonRpcServer = new JsonRpcServer(hre.userConfig.networks?.hardhat?.nodePath, hre.userConfig.networks?.hardhat?.adapterPath);

            return server;
        },
    );


task(TASK_NODE, 'Start a PolkaVM Node')
    .setAction(async (args: TaskArguments, { network, run }, runSuper) => {
        if (network.polkavm !== true || network.name !== HARDHAT_NETWORK_NAME) {
            return await runSuper();
        }

        await run(TASK_NODE_POLKAVM, args);
    });

// Main task of the plugin. It starts the server and listens for requests.
task(TASK_NODE_POLKAVM, 'Starts a JSON-RPC server for PolkaVM node')
    .addOptionalParam(
        'fork',
        'Starts a local network that is a fork of another network (testnet, mainnet, http://XXX:YY)',
        undefined,
        types.string,
    )
    .addOptionalParam('endpoint', 'WSS endpoint for the server to listen on - default: 8000', undefined, types.string)
    .addOptionalParam('adapterEndpoint', 'WSS endpoint for the Eth RPC Adapter to listen on - default: 8545', undefined, types.string)
    .addOptionalParam('port', 'Port to listen on - default: 8000', undefined, types.int)
    .addOptionalParam('adapterPort', 'Port for the Eth RPC Adapter to listen on - default: 8545', undefined, types.int)
    .addOptionalParam('dev', 'Endpoint for the Eth RPC Adapter to listen on - default: 8545', undefined, types.boolean)
    .addOptionalParam('forkBlockNumber', 'Fork at the specified block height', undefined, types.int)
    .setAction(
        async (
            {
                fork,
                endpoint,
                adapterEndpoint,
                port,
                adapterPort,
                dev,
                forkBlockNumber,
            }: {
                fork: string;
                endpoint: string;
                adapterEndpoint: string;
                port: number;
                adapterPort: number;
                dev: boolean;
                forkBlockNumber: number;
            },
            { run },
        ) => {
            const commandArgs = constructCommandArgs({
                fork,
                endpoint,
                adapterEndpoint,
                port,
                adapterPort,
                dev,
                forkBlockNumber,
            });

            // Create the server
            const server: RpcServer = await run(TASK_NODE_POLKAVM_CREATE_SERVER);

            try {
                await server.listen(commandArgs.nodeCommands, commandArgs.adapterCommands);
            } catch (error: any) {
                throw new PolkaVMNodePluginError(`Failed when running node: ${error.message}`);
            }
        },
    );

subtask(TASK_RUN_POLKAVM_NODE_IN_SEPARATE_PROCESS, 'Runs a Hardhat PolkaVM task in a separate process.')
    .addVariadicPositionalParam('taskArgs', 'Arguments for the Hardhat PolkaVM task.')
    .setAction(async ({ taskArgs = [] }, _hre) => {
        const currentPort = await getAvailablePort(ETH_RPC_ADAPTER_START_PORT, MAX_PORT_ATTEMPTS);
        const adjustedArgs = adjustTaskArgsForPort(taskArgs, currentPort);

        const taskProcess = spawn('npx', ['hardhat', TASK_NODE_POLKAVM, ...adjustedArgs], {
            detached: true,
        });

        return {
            process: taskProcess,
            port: currentPort,
        };
    });

task(
    TASK_TEST,
    async (
        {
            testFiles,
            noCompile,
            parallel,
            bail,
            grep,
        }: {
            testFiles: string[];
            noCompile: boolean;
            parallel: boolean;
            bail: boolean;
            grep?: string;
        },
        { run, network, userConfig, config },
        runSuper,
    ) => {
        if (network.polkavm !== true || network.name !== HARDHAT_NETWORK_NAME) {
            return await runSuper();
        }

        if (!noCompile) {
            await run(TASK_COMPILE, { quiet: true });
        }

        const files = await run(TASK_TEST_GET_TEST_FILES, { testFiles });


        const currentNodePort = await getAvailablePort(CHOPSTICKS_START_PORT, MAX_PORT_ATTEMPTS);
        const currentAdapterPort = await getAvailablePort(ETH_RPC_ADAPTER_START_PORT, MAX_PORT_ATTEMPTS);

        const commandArgs = constructCommandArgs({ port: currentNodePort, adapterPort: currentAdapterPort });

        const server = new JsonRpcServer(userConfig.networks?.hardhat?.nodePath, userConfig.networks?.hardhat?.adapterPath);

        try {
            await server.listen(commandArgs.nodeCommands, commandArgs.adapterCommands, false);

            await waitForNodeToBeReady(currentNodePort);
            await waitForNodeToBeReady(currentAdapterPort);
            await configureNetwork(config, network, currentAdapterPort ? currentAdapterPort : currentNodePort);

            let testFailures = 0;
            try {
                testFailures = await run(TASK_TEST_RUN_MOCHA_TESTS, {
                    testFiles: files,
                    parallel,
                    bail,
                    grep,
                });
            } finally {
                await server.stop();
            }

            process.exitCode = testFailures;
            return testFailures;
        } catch (error: any) {
            throw new PolkaVMNodePluginError(`Failed when running node: ${error.message}`);
        }
    },
);

interceptAndWrapTasksWithNode();
