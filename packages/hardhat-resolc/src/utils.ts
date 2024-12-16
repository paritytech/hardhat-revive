import { Artifact } from "hardhat/types";
import { ARTIFACT_FORMAT_VERSION } from "hardhat/internal/constants";
import { ResolcConfig, SolcConfigData } from "./types";
import { COMPILER_RESOLC_NEED_EVM_CODEGEN } from "./constants";
import chalk from 'chalk';
import { ResolcPluginError } from "./errors";

export function getArtifactFromContractOutput(
  sourceName: string,
  contractName: string,
  contractOutput: any
): Artifact {
  const evmBytecode = contractOutput.evm?.bytecode;
  let bytecode: string = evmBytecode?.object ?? "";

  const evmDeployedBytecode = contractOutput.evm?.deployedBytecode;
  let deployedBytecode: string = evmDeployedBytecode?.object ?? "";

  const linkReferences = evmBytecode?.linkReferences ?? {};
  const deployedLinkReferences = evmDeployedBytecode?.linkReferences ?? {};

  return {
    _format: ARTIFACT_FORMAT_VERSION,
    contractName,
    sourceName,
    abi: contractOutput.abi,
    bytecode,
    deployedBytecode,
    linkReferences,
    deployedLinkReferences,
  };
}

export function getVersionComponents(version: string): number[] {
  const versionComponents = version.split('.');
  return [parseInt(versionComponents[0], 10), parseInt(versionComponents[1], 10), parseInt(versionComponents[2], 10)];
}

export function updateDefaultCompilerConfig(solcConfigData: SolcConfigData, resolc: ResolcConfig) {
  const compiler = solcConfigData.compiler;

  const settings = compiler.settings || {};

  compiler.settings = { ...settings, optimizer: { ...resolc.settings.optimizer }, evmVersion: resolc.settings.evmVersion };

  resolc.settings.forceEVMLA = resolc.settings.forceEVMLA || false;

  const [major, minor] = getVersionComponents(compiler.version);
  if (major === 0 && minor < 8) {
    console.warn(chalk.blue(COMPILER_RESOLC_NEED_EVM_CODEGEN));
    compiler.settings.forceEVMLA = true;
  }

  delete compiler.settings.metadata;
}

export function pluralize(n: number, singular: string, plural?: string) {
  if (n === 1) {
    return singular;
  }

  if (plural !== undefined) {
    return plural;
  }

  return `${singular}s`;
}

export function extractCommands(config: ResolcConfig): string[] {

  const settings = config.settings;

  const commandArgs: string[] = [];

  if (settings.yul) {
    commandArgs.push(`--yul`);

    if (settings.solcPath) {
      commandArgs.push(`--solc=${settings.solcPath}`);
    };

    if (settings.optimizer?.enabled) {
      commandArgs.push(`--optimization=${settings.optimizer.parameters || '3'}`);
    };

    if (settings.llvmVerifyEach) {
      commandArgs.push(`--llvm-verify-each`);
    };

    if (settings.llvmDebugLogging) {
      commandArgs.push(`--llvm-debug-logging`);
    };

    if (settings.metadataHash) {
      if (settings.metadataHash !== 'none') {
        throw new ResolcPluginError(`--metadata-hash only supported value is 'none'.`);
      };
      commandArgs.push(`--metadata-hash=${settings.metadataHash}`)
    };

    if (settings.debugOutputDir) {
      commandArgs.push(`--debug-output-dir=${settings.debugOutputDir}`);
    };

    if (settings.emitDourceDebugInfo) {
      commandArgs.push(`-g`);
    };

    if (settings.asm) {
      commandArgs.push(`--asm`);
    };

    if (settings.bin) {
      commandArgs.push(`--bin`);
    };

    if (settings.outputDir) {
      commandArgs.push(`--output-dir=${settings.outputDir}`);
    };

    return commandArgs;

  } else if (settings.llvmIR) {
    commandArgs.push(`--llvm-ir`);

    if (settings.optimizer?.enabled) {
      commandArgs.push(`--optimization=${settings.optimizer.parameters || '3'}`);
    };

    if (settings.llvmVerifyEach) {
      commandArgs.push(`--llvm-verify-each`);
    };

    if (settings.llvmDebugLogging) {
      commandArgs.push(`--llvm-debug-logging`);
    };

    if (settings.metadataHash) {
      if (settings.metadataHash !== 'none') {
        throw new ResolcPluginError(`--metadata-hash only supported value is 'none'.`);
      };
      commandArgs.push(`--metadata-hash=${settings.metadataHash}`)
    };

    if (settings.debugOutputDir) {
      commandArgs.push(`--debug-output-dir=${settings.debugOutputDir}`);
    };

    if (settings.emitDourceDebugInfo) {
      commandArgs.push(`-g`);
    };

    if (settings.asm) {
      commandArgs.push(`--asm`);
    };

    if (settings.bin) {
      commandArgs.push(`--bin`);
    };

    if (settings.outputDir) {
      commandArgs.push(`--output-dir=${settings.outputDir}`);
    };

    return commandArgs;

  } else if (settings.standardJson) {
    commandArgs.push(`--standard-json`);

    if (settings.solcPath) {
      commandArgs.push(`--solc=${settings.solcPath}`);
    };

    if (settings.detectMissingLibraries) {
      commandArgs.push(`--detect-missing-libraries`)
    };

    if (settings.forceEVMLA) {
      commandArgs.push(`--force-evmla`);
    };

    if (settings.basePath) {
      commandArgs.push(`--base-path=${settings.basePath}`);
    };

    if (settings.includePaths) {
      commandArgs.push(`--include-paths=${settings.includePaths}`);
    };

    if (settings.allowPaths) {
      if (!settings.basePath) {
        throw new ResolcPluginError(`--allow-paths option is only available when --base-path has a non-empty value.`)
      }
      commandArgs.push(`--allow-paths=${settings.allowPaths}`);
    };

    if (settings.debugOutputDir) {
      commandArgs.push(`--debug-output-dir=${settings.debugOutputDir}`);
    };

    if (settings.emitDourceDebugInfo) {
      commandArgs.push(`-g`);
    };

    if (settings.asm) {
      commandArgs.push(`--asm`);
    };

    if (settings.bin) {
      commandArgs.push(`--bin`);
    };

    if (settings.outputDir) {
      commandArgs.push(`--output-dir=${settings.outputDir}`);
    };

    return commandArgs;

  } else if (settings.combinedJson) {
    commandArgs.push(`--combined-json=${settings.combinedJson}`);

    if (settings.libraries) {
      commandArgs.push(`-l=${settings.libraries}`)
    };

    if (settings.solcPath) {
      commandArgs.push(`--solc=${settings.solcPath}`);
    };

    if (settings.evmVersion) {
      commandArgs.push(`--evm-version=${settings.evmVersion}`);
    };

    if (settings.disableSolcOptimizer) {
      commandArgs.push(`--disable-solc-optimizer`);
    };

    if (settings.optimizer?.enabled) {
      commandArgs.push(`--optimization=${settings.optimizer.parameters || '3'}`);
    };

    if (settings.forceEVMLA) {
      commandArgs.push(`--force-evmla`);
    };

    if (settings.metadataHash) {
      if (settings.metadataHash !== 'none') {
        throw new ResolcPluginError(`--metadata-hash only supported value is 'none'.`);
      };
      commandArgs.push(`--metadata-hash=${settings.metadataHash}`)
    };

    if (settings.basePath) {
      commandArgs.push(`--base-path=${settings.basePath}`);
    };

    if (settings.includePaths) {
      commandArgs.push(`--include-paths=${settings.includePaths}`);
    };

    if (settings.allowPaths) {
      if (!settings.basePath) {
        throw new ResolcPluginError(`--allow-paths option is only available when --base-path has a non-empty value.`)
      }
      commandArgs.push(`--allow-paths=${settings.allowPaths}`);
    };

    if (settings.suppressWarnings) {
      commandArgs.push(`--suppress-warnings=${settings.suppressWarnings.join(' ')}`);
    };

    if (settings.debugOutputDir) {
      commandArgs.push(`--debug-output-dir=${settings.debugOutputDir}`);
    };

    if (settings.emitDourceDebugInfo) {
      commandArgs.push(`-g`);
    };

    if (settings.overwrite) {
      commandArgs.push(`--overwrite`);
    };

    if (settings.asm) {
      commandArgs.push(`--asm`);
    };

    if (settings.bin) {
      commandArgs.push(`--bin`);
    };

    if (settings.outputDir) {
      commandArgs.push(`--output-dir=${settings.outputDir}`);
    };

    return commandArgs;
  } else {
    if (settings.libraries) {
      commandArgs.push(`-l=${settings.libraries}`)
    };

    if (settings.solcPath) {
      commandArgs.push(`--solc=${settings.solcPath}`);
    };

    if (settings.evmVersion) {
      commandArgs.push(`--evm-version=${settings.evmVersion}`);
    };

    if (settings.disableSolcOptimizer) {
      commandArgs.push(`--disable-solc-optimizer`);
    };

    if (settings.optimizer?.enabled) {
      commandArgs.push(`--optimization=${settings.optimizer.parameters || '3'}`);
    };

    if (settings.forceEVMLA) {
      commandArgs.push(`--force-evmla`);
    };

    if (settings.metadataHash) {
      if (settings.metadataHash !== 'none') {
        throw new ResolcPluginError(`--metadata-hash only supported value is 'none'.`);
      };
      commandArgs.push(`--metadata-hash=${settings.metadataHash}`)
    };

    if (settings.basePath) {
      commandArgs.push(`--base-path=${settings.basePath}`);
    };

    if (settings.includePaths) {
      commandArgs.push(`--include-paths=${settings.includePaths}`);
    };

    if (settings.allowPaths) {
      if (!settings.basePath) {
        throw new ResolcPluginError(`--allow-paths option is only available when --base-path has a non-empty value.`)
      }
      commandArgs.push(`--allow-paths=${settings.allowPaths}`);
    };

    if (settings.suppressWarnings) {
      commandArgs.push(`--suppress-warnings=${settings.suppressWarnings.join(' ')}`);
    };

    if (settings.debugOutputDir) {
      commandArgs.push(`--debug-output-dir=${settings.debugOutputDir}`);
    };

    if (settings.emitDourceDebugInfo) {
      commandArgs.push(`-g`);
    };

    if (settings.asm) {
      commandArgs.push(`--asm`);
    };

    if (settings.bin) {
      commandArgs.push(`--bin`);
    };

    if (settings.outputDir) {
      commandArgs.push(`--output-dir=${settings.outputDir}`);
    };

    return commandArgs;
  };
}
