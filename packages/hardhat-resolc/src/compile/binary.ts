import { exec } from 'child_process';
import { ResolcConfig } from '../types';

export async function compileWithBinary(
    input: any,
    config: ResolcConfig,
): Promise<any> {
    const {
        basePath,
        includePath,
        allowPaths,
        outputDir,
        overwrite,
        optimizer,
        solcPath,
        evmVersion,
        combinedJson,
        standardJson,
        detectMissingLibraries,
        yul,
        llvmIR,
        forceEVMLA,
        metadataHash,
        asm,
        bin,
        suppressWarnings,
        debugOutputDir,
        llvmVerifyEach,
        llvmDebugLogging,
        compilerPath
    } = config.settings;

    let processCommand = `${compilerPath} 
    ${basePath ? `--base-path ${basePath}` : ''}
    ${includePath ? `--include-path ${includePath}` : ''}
    ${allowPaths ? `--allow-paths ${allowPaths}` : ''}
    ${outputDir ? `--output-dir ${outputDir}` : ''}
    ${overwrite ? '--overwrite' : ''}
    ${optimizer?.enabled ? `--optimization ${optimizer.parameters}` : ''}
    ${optimizer?.fallbackOz ? '--fallback-Oz' : ''}
    ${solcPath ? `--solc ${solcPath}` : ''}
    ${evmVersion ? `--evm-version ${evmVersion}` : ''}
    ${combinedJson ? `--combined-json ${combinedJson}` : ''}
    ${standardJson ? `--standard-json ${standardJson}` : ''}
    ${detectMissingLibraries ? '--detect-missing-libraries' : ''}
    ${yul ? '--yul' : ''}
    ${llvmIR ? '--llvm-ir' : ''}
    ${forceEVMLA ? '--force-evmla' : ''}
    ${metadataHash ? `--metadata-hash ${metadataHash}` : ''}
    ${asm ? '--asm' : ''}
    ${bin ? '--bin' : ''}
    ${suppressWarnings ? `--suppress-warnings ${suppressWarnings}` : ''}
    ${debugOutputDir ? `--debug-output-dir ${debugOutputDir}` : ''}
    ${llvmVerifyEach ? '--llvm-verify-each' : ''}
    ${llvmDebugLogging ? '--llvm-debug-logging' : ''}
    `;

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
