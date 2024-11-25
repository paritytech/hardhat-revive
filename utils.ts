import { HardhatRuntimeEnvironment } from "hardhat/types";
import { sync as glob } from "fast-glob";
import { join } from "path";

// Function to get the source files from the Hardhat project
function sources(hre: HardhatRuntimeEnvironment): string[] {
  return glob([join(hre.config.paths.sources, "**/*.sol")], {
    deep: 419,
    ignore: ["**/node_modules"],
    absolute: true,
  });
}

export { sources };
