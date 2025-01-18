import { spawn, ChildProcess, StdioOptions, exec } from 'child_process';
import chalk from 'chalk';

import { CHOPSTICKS_START_PORT, ETH_RPC_ADAPTER_START_PORT } from './constants';
import { RpcServer } from './types';
import { PolkaVMNodePluginError } from './errors';

export class JsonRpcServer implements RpcServer {
    private serverProcess: ChildProcess | null = null;
    private adapterProcess: ChildProcess | null = null;
    private serverPort: number | null = null;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    constructor(
        private readonly nodeBinaryPath: string | undefined,
        private readonly adapterBinaryPath: string | undefined
    ) {}

    public listen(chopsticksArgs: string[] = [], adapterArgs: string[] = [], blockProcess: boolean = true): Promise<void> {
        return new Promise((resolve, reject) => {
            const chopsticksCommand = this.nodeBinaryPath && chopsticksArgs.find((arg) => arg.startsWith('--forking=')) ? this.nodeBinaryPath : chopsticksArgs[0];
            const chopsticksCommandArgs = chopsticksArgs.slice(1);

            const chopsticksPortArg = chopsticksArgs.find((arg) => arg.startsWith('--port='));
            const chopsticksPort = chopsticksPortArg ? parseInt(chopsticksPortArg.split('=')[1], 10) : CHOPSTICKS_START_PORT;

            if (blockProcess) {
                console.info(chalk.green(`Starting server at 127.0.0.1:${chopsticksPort}`));
                console.info(chalk.green(`Running command: ${chopsticksCommand} ${chopsticksCommandArgs.join(' ')}`));
            }

            let stdioConfig: StdioOptions = 'inherit';
            if (!blockProcess) {
                stdioConfig = ['ignore', 'ignore', 'ignore'];
            }

            this.serverPort = chopsticksPort;

            this.serverProcess = spawn(chopsticksCommand, chopsticksCommandArgs, { stdio: stdioConfig });
            
            const adapterCommand = this.adapterBinaryPath;

            if (!adapterCommand) {
                throw new PolkaVMNodePluginError('A path for the Eth RPC Adapter must be provided.');
            };

            const adapterPortArg = adapterArgs.find((arg) => arg.startsWith('--port='));
            const adapterPort = adapterPortArg ? parseInt(adapterPortArg.split('=')[1], 10) : ETH_RPC_ADAPTER_START_PORT;

            this.adapterProcess = spawn(adapterCommand, adapterArgs, { stdio: stdioConfig });

            if (blockProcess) {
                console.info(chalk.green(`Starting the Eth RPC Adapter at 127.0.0.1:${adapterPort}`));
                console.info(chalk.green(`Running command: ${adapterCommand} ${adapterArgs.join(' ')}`));
            }

            let terminatedProcesses = 0;
            const processExitHandler = (process: ChildProcess, name: string, port?: number) => {
                process.on('exit', (code, signal) => {
                    if (signal) {
                        console.info(chalk.yellow(`Received ${signal} signal. The ${name} process has exited.`));
                    } else if (code !== 0) {
                        console.info(chalk.red(`The ${name} process exited with code: ${code}`));
                    }

                    terminatedProcesses++;

                    if (terminatedProcesses === 2) {
                        if (this.serverProcess?.exitCode === null && this.adapterProcess?.exitCode === 0) {
                            console.info(chalk.green('Both processes exited successfully.'));
                        } else {
                            console.warn(chalk.yellow('One or both processes did not exit normally.'));
                        }
                        resolve();
                    }
                });
            };

            this.serverProcess.on('error', (error) => {
                console.info(chalk.red('Error running the server:', error));
                reject(new Error(`Error running the server: ${error.message}`));
            });

            this.adapterProcess.on('error', (error) => {
                console.info(chalk.red('Error running the Eth RPC Adapter:', error));
                reject(new Error(`Error running the Eth RPC Adapter: ${error.message}`));
            });

            processExitHandler(this.adapterProcess, 'adapter');
            processExitHandler(this.serverProcess, 'server', this.serverPort);

            if (!blockProcess) {
                resolve();
            }
        });
    }

    
    public stop(): Promise<void> {
        return new Promise((resolve) => {
            if (this.adapterProcess && !this.adapterProcess.killed) {
                this.adapterProcess.kill();
            }

            if (this.serverProcess && !this.serverProcess.killed) {
                this.serverProcess.kill();
            }

            resolve();
        });
    }
}
