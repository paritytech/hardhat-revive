import { spawn, ChildProcess, StdioOptions } from 'child_process';
import chalk from 'chalk';

import { CHOPSTICKS_START_PORT, ETH_RPC_ADAPTER_START_PORT, PROCESS_TERMINATION_SIGNALS } from './constants';
import { RpcServer } from './types';
import { PolkaVMNodePluginError } from './errors';

export class JsonRpcServer implements RpcServer {
    private serverProcess: ChildProcess | null = null;
    private adapterProcess: ChildProcess | null = null;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    constructor(
        private readonly adapterBinaryPath: string | undefined,
        private readonly nodeBinaryPath: string | undefined
    ) {}

    public listen(chopsticksArgs: string[] = [], adapterArgs: string[] = [], blockProcess: boolean = true): Promise<void> {
        return new Promise((resolve, reject) => {
            const chopsticksCommand = this.nodeBinaryPath ? this.nodeBinaryPath : chopsticksArgs[0];
            const chopsticksCommandArgs = chopsticksArgs;

            const chopsticksPortArg = chopsticksArgs.find((arg) => arg.startsWith('--port='));
            const chopsticksPort = chopsticksPortArg ? parseInt(chopsticksPortArg.split('=')[1], 10) : CHOPSTICKS_START_PORT;

            if (blockProcess) {
                console.info(chalk.green(`Starting chopsticks at 127.0.0.1:${chopsticksPort}`));
                console.info(chalk.green(`Running command: ${chopsticksCommand} ${chopsticksCommandArgs.join(' ')}`));
            }

            let stdioConfig: StdioOptions = 'inherit';
            if (!blockProcess) {
                stdioConfig = ['ignore', 'ignore', 'ignore'];
            }
            this.serverProcess = spawn(chopsticksCommand, chopsticksCommandArgs, { stdio: stdioConfig });

            const adapterCommand = this.adapterBinaryPath;

            if (!adapterCommand) {
                throw new PolkaVMNodePluginError('A path for the Eth RPC Adapter must be provided.')
            };

            const adapterPortArg = adapterArgs.find((arg) => arg.startsWith('--port='));
            const adapterPort = adapterPortArg ? parseInt(adapterPortArg.split('=')[1], 10) : ETH_RPC_ADAPTER_START_PORT;

            this.adapterProcess = spawn(adapterCommand, adapterArgs, { stdio: stdioConfig })

            if (blockProcess) {
                console.info(chalk.green(`Starting the Eth RPC Adapter at 127.0.0.1:${adapterPort}`));
                console.info(chalk.green(`Running command: ${adapterCommand} ${adapterArgs.join(' ')}`));
            }

            this.serverProcess.on('error', (error) => {
                console.info(chalk.red('Error running the server:', error));
                reject(new Error(`Error running the server: ${error.message}`));
            });

            this.serverProcess.on('exit', (code, signal) => {
                if (signal && PROCESS_TERMINATION_SIGNALS.includes(signal)) {
                    console.info(chalk.yellow(`Received ${signal} signal. The server process has exited.`));
                    resolve();
                } else {
                    reject(new Error(`The server process exited with code: ${code}`));
                }
            });

            this.adapterProcess.on('error', (error) => {
                console.info(chalk.red('Error running the Eth RPC Adapter:', error));
                reject(new Error(`Error running the Eth RPC Adapter: ${error.message}`));
            });

            this.adapterProcess.on('exit', (code, signal) => {
                if (signal && PROCESS_TERMINATION_SIGNALS.includes(signal)) {
                    console.info(chalk.yellow(`Received ${signal} signal. The Eth RPC Adapter process has exited.`));
                    resolve();
                } else {
                    reject(new Error(`The Eth RPC Adapter process exited with code: ${code}`));
                }
            });

            if (!blockProcess) {
                resolve();
            }
        });
    }

    public stop(): Promise<void> {
        return new Promise((resolve) => {
            if (this.serverProcess && !this.serverProcess.killed) {
                this.serverProcess.kill(); // Sends SIGTERM
            }

            if (this.adapterProcess && !this.adapterProcess.killed) {
                this.adapterProcess.kill(); // Sends SIGTERM
            }
            resolve();
        });
    }
}
