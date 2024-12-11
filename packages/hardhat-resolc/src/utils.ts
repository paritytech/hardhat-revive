import { Artifact } from "hardhat/types";
import { ARTIFACT_FORMAT_VERSION } from "hardhat/internal/constants";

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


export function pluralize(n: number, singular: string, plural?: string) {
  if (n === 1) {
      return singular;
  }

  if (plural !== undefined) {
      return plural;
  }

  return `${singular}s`;
}
