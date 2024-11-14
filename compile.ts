import { task } from "hardhat/config";
import { exec as execCb } from "child_process";
import { promisify } from "util";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { compile as reviveCompile } from '@parity/revive'
import { sources } from "./utils";
import path, { join } from "path";
import { existsSync, readFileSync, rmSync, writeFileSync } from "fs";
import { mkdir } from "fs/promises";

// Promisify exec from child_process for async execution
const exec = promisify(execCb);

task("compile", "Compile Solidity files to PolkaVM").setAction(
    async (_, hre: HardhatRuntimeEnvironment) => {

        const inputs = sources(hre);

        for (const input of inputs) {

            const result = await compile(input, hre);
            if (result.success) {
                console.log(`${input} compiled successfully.`);
            } else {
                console.error(`Failed to compile ${input}: ${result.error}`);
            }
        }

        console.log("Compilation finished.");

    }
);

async function compile(fileName: string, hre: HardhatRuntimeEnvironment) {

    const output = JSON.parse('{"__format": "hh-sol-artifact-1", "contractName": "", "sourceName": "", "abi": "", "bytecode": ""}'); // Boilerplate JSON
    const file = path.basename(fileName); // Name of the .sol file

    const possiblyContractName = readFileSync(fileName, 'utf8').match(/contract\s+([a-zA-Z0-9_]+)/); // Attempt to retrieve the Smart Contract's name

    const contractName = possiblyContractName && possiblyContractName[1] ? possiblyContractName[1] : ""; // Just the contract name, gotta add an error here
    
    console.log(`Compiling contract: ${contractName}`);

    // Run the compiler
    const out = await reviveCompile({
        [file]: { content: readFileSync(fileName, 'utf8') },
    });

    if (out.errors && out.errors.length > 0) {
        return { success: false, error: out.errors };
    }

    // Retrieve the data from the compiled output 
    const entry = out.contracts[file][contractName];

    output["abi"] = entry.abi;
    output["bytecode"] = entry.evm.bytecode.object;

    const outPath = join(hre.config.paths.artifacts, 'contracts', file); // Path ending in .json  

    if (existsSync(outPath)) {
        rmSync(outPath, { recursive: true });
    }

    await mkdir(outPath, { recursive: true });

    writeFileSync(join(outPath.slice(0, -4) + '.sol', contractName + '.json'), JSON.stringify(output, null, 2));
    
    return { success: true };

}
