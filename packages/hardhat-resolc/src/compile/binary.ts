import { exec } from 'child_process';
import { ContractBatch, ContractSource, ResolcConfig } from '../types';
import { CompilerInput } from 'hardhat/types';
import { extractCommands, mapImports, orderSources } from '../utils';

export async function compileWithBinary(
    input: CompilerInput,
    config: ResolcConfig,
): Promise<any> {
    const {
        compilerPath,
        batchSize
    } = config.settings;

    const commands = extractCommands(config);

    let processCommand = `${compilerPath} ${commands.join(' ')}`;

    const map = mapImports(input);

    const ordered = orderSources(map)

    if (batchSize) {
        let selectedContracts: ContractBatch = {};
        for (let i = 0; i * batchSize < ordered.length; i++) {
            selectedContracts = ordered.reduce((acc, key) => {
                acc[key] = input.sources[key];
                return acc;
            }, {} as ContractSource);

            const contractBatch: ContractBatch = { "language": input.language, "sources": selectedContracts, "settings": input.settings };

            const output: string = await new Promise((resolve, reject) => {
                const process = exec(
                    processCommand,
                    {
                        maxBuffer: 1024 * 1024 * 500,
                    },
                    (err, stdout, _stderr) => {
                        if (err !== null) {
                            return reject(err);
                        }
                        resolve(stdout);
                    },
                );

                process.stdin!.write(JSON.stringify(contractBatch));
                process.stdin!.end();
            });

            return JSON.parse(output)
        };

    } else {
        const output: string = await new Promise((resolve, reject) => {
            const process = exec(
                processCommand,
                {
                    maxBuffer: 1024 * 1024 * 500,
                },
                (err, stdout, _stderr) => {
                    if (err !== null) {
                        return reject(err);
                    }
                    resolve(stdout);
                },
            );

            process.stdin!.write(JSON.stringify(input));
            process.stdin!.end();
        });

        return JSON.parse(output);
    }
}
