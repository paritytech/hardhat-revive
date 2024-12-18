import { ResolcConfig } from "./types";

export const PLUGIN_NAME = 'hardhat-resolc';
export const RESOLC_ARTIFACT_FORMAT_VERSION = 'hh-resolc-artifact-1';
export const DEFAULT_TIMEOUT_MILISECONDS = 30000;

export const COMPILER_RESOLC_NEED_EVM_CODEGEN = `Yul codegen is only supported for solc >= 0.8. Flag forceEVMLA will automatically be set to true by default.`;

export const defaultRemixResolcConfig: ResolcConfig = {
    version: 'latest',
    compilerSource: 'remix',
    settings: {
        optimizer: {
            enabled: true,
            runs: 200,
        },
    },
};

export const defaultBinaryResolcConfig: ResolcConfig = {
    version: 'latest',
    compilerSource: 'binary',
    settings: {
        optimizer: {
            enabled: true,
        }
    },
};
