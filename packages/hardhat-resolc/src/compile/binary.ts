import { exec } from 'child_process';
import { ResolcConfig } from '../types';
import { CompilerInput } from 'hardhat/types';
import { extractCommands } from '../utils';

export async function compileWithBinary(
    input: CompilerInput,
    config: ResolcConfig,
): Promise<any> {
    const {
        compilerPath
    } = config.settings;

    const commands = extractCommands(config);

    let processCommand = `${compilerPath} ${commands.join(' ')}`;

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
