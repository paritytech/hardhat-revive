import { task, subtask } from 'hardhat/config';
import {
    TASK_NODE,
    TASK_RUN,
} from 'hardhat/builtin-tasks/task-names';

import { HARDHAT_NETWORK_NAME } from 'hardhat/plugins';
import { HardhatRuntimeEnvironment, TaskArguments } from 'hardhat/types';
import {
    TASK_RUN_NODE_POLKAVM,
    TASK_RUN_NODE_POLKAVM_ETH_RPC_ADAPTER,
    TASK_RUN_NODE_POLKAVM_SERVER,
} from './constants';
import { interceptAndWrapTasksWithNode } from './core/global-interceptor';
// import { runScriptWithHardhat } from './core/script-runner';

task(TASK_RUN).setAction(async (args, hre, runSuper) => {
    if (!hre.network.polkavm || hre.network.name !== HARDHAT_NETWORK_NAME) {
        await runSuper(args, hre);
        return;
    }

    await hre.run(TASK_RUN_NODE_POLKAVM)
});

task(TASK_NODE, 'Start a PolkaVM Node along with an Eth RPC Adapter.').setAction(
    async (args: TaskArguments, hre: HardhatRuntimeEnvironment, runSuper) => {
        if (hre.network.polkavm !== true || hre.network.name !== HARDHAT_NETWORK_NAME) {
            return await runSuper();
        }

        await hre.run(TASK_RUN_NODE_POLKAVM_SERVER, args);
        await hre.run(TASK_RUN_NODE_POLKAVM_ETH_RPC_ADAPTER, args)
    });

subtask(TASK_RUN_NODE_POLKAVM_SERVER, 'Start a PolkaVM Node').setAction(
    async (_args: TaskArguments, hre: HardhatRuntimeEnvironment) => {
        const nodeBinPath = hre.network.config.nodeConfig?.nodeBinaryPath || `./bin/node/`;
        


    });

subtask(TASK_RUN_NODE_POLKAVM_ETH_RPC_ADAPTER, 'Start a PolkaVM Eth RPC Adapter').setAction(
    async (args: TaskArguments, hre: HardhatRuntimeEnvironment) => {
    });

interceptAndWrapTasksWithNode();
