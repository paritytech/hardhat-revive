import { Artifact } from "hardhat/types";
import { ARTIFACT_FORMAT_VERSION } from "hardhat/internal/constants";
import { ResolcConfig, SolcConfigData } from "./types";
import { COMPILER_RESOLC_NEED_EVM_CODEGEN } from "./constants";
import chalk from 'chalk';

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
