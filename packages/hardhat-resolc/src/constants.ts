import { ResolcConfig } from "./types";

export const PLUGIN_NAME = '@matterlabs/hardhat-resolc';
export const RESOLC_ARTIFACT_FORMAT_VERSION = 'hh-resolc-artifact-1';
export const DEFAULT_TIMEOUT_MILISECONDS = 30000;
export const RESOLC_DEFAULT_COMPILER_VERSION = '0.1.0-dev.6';
export const COMPILER_MIN_LLVM_VERSION = '18.1.4';

export const RESOLC_COMPILER_PATH_VERSION = 'local_or_remote';
export const TASK_UPDATE_SOLIDITY_COMPILERS = 'compile:update-solidity-compilers';

export const COMPILER_RESOLC_NEED_EVM_CODEGEN = `Yul codegen is only supported for solc >= 0.8. Flag forceEVMLA will automatically be set to true by default.`;

export const defaultResolcConfig: ResolcConfig = {
    version: 'latest',
    compilerSource: 'remix',
    settings: {
        optimizer: {
            enabled: true,
            runs: 200,
        },
    },
};
