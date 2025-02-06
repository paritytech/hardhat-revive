import { CompilerInput } from "hardhat/types";
import { ResolcConfig } from "../types";
import { compileWithBinary } from "./binary";
import { compileWithRemix } from "./remix";
import { ResolcPluginError } from "../errors";
import chalk from 'chalk';

export interface ICompiler {
    compile(input: CompilerInput, config: ResolcConfig): Promise<any>;
}

export async function compile(resolcConfig: ResolcConfig, input: CompilerInput) {
    let compiler: ICompiler;
    
    if (resolcConfig.compilerSource === 'binary') {
        if (resolcConfig.settings.solcPath === null) {
            throw new ResolcPluginError('resolc executable is not specified');
        }
        compiler = new BinaryCompiler(resolcConfig);
    } else if (resolcConfig.compilerSource === 'remix') {
        if (resolcConfig.settings.batchSize) console.warn(chalk.yellow('Batch compilation is only available for `binary` source.\nSetting batchSize will be ignored.'));
        
        compiler = new RemixCompiler(resolcConfig);
    } else {
        throw new ResolcPluginError(`Incorrect compiler source: ${resolcConfig.compilerSource}`);
    }

    return await compiler.compile(input, resolcConfig);
}

export class BinaryCompiler implements ICompiler {
    constructor(public config: ResolcConfig) {}

    public async compile(input: CompilerInput) {
        return await compileWithBinary(input, this.config);
    }
}

export class RemixCompiler implements ICompiler {
    constructor(public config: ResolcConfig) {}

    public async compile(input: CompilerInput) {
        return await compileWithRemix(input, this.config);
    }
}
