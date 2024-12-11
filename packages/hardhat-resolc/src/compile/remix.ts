import solc from 'solc';
import path from 'path'
import { existsSync, readFileSync } from 'fs'
import { ResolcConfig, SolcError, SolcInput, SolcOutput } from "../types";
import { exec as execCb } from 'child_process';
import { promisify } from 'util';

const exec = promisify(execCb);

export function resolveInputs(sources: SolcInput): SolcInput {
    const input = {
        language: 'Solidity',
        sources,
        settings: {
            outputSelection: {
                '*': {
                    '*': ['evm.bytecode.object'],
                },
            },
        },
    }

    const out = solc.compile(JSON.stringify(input), {
        import: (path: string) => {
            return {
                contents: readFileSync(tryResolveImport(path), 'utf8'),
            }
        },
    })

    const output = JSON.parse(out) as {
        sources: { [fileName: string]: { id: number } }
        errors: Array<SolcError>
    }

    if (output.errors && Object.keys(output.sources).length === 0) {
        throw new Error(output.errors[0].formattedMessage)
    }

    return Object.fromEntries(
        Object.keys(output.sources).map((fileName) => {
            return [
                fileName,
                sources[fileName] ?? {
                    content: readFileSync(tryResolveImport(fileName), 'utf8'),
                },
            ]
        })
    )
}

export function tryResolveImport(importPath: string) {
    if (existsSync(importPath)) {
        return path.resolve(importPath)
    }

    const importRegex = /^(@?[^@/]+(?:\/[^@/]+)?)(?:@([^/]+))?(\/.+)$/
    const match = importPath.match(importRegex)

    if (!match) {
        throw new Error('Invalid import path format.')
    }

    const basePackage = match[1]
    const specifiedVersion = match[2]
    const relativePath = match[3]

    let packageJsonPath
    try {
        packageJsonPath = require.resolve(
            path.join(basePackage, 'package.json')
        )
    } catch {
        throw new Error(`Could not resolve package ${basePackage}`)
    }

    if (specifiedVersion) {
        const installedVersion = JSON.parse(
            readFileSync(packageJsonPath, 'utf-8')
        ).version

        if (installedVersion !== specifiedVersion) {
            throw new Error(
                `Version mismatch: Specified ${basePackage}@${specifiedVersion}, but installed version is ${installedVersion}`
            )
        }
    }

    const packageRoot = path.dirname(packageJsonPath)

    const resolvedPath = path.join(packageRoot, relativePath)
    if (existsSync(resolvedPath)) {
        return resolvedPath
    } else {
        throw new Error(`Resolved path ${resolvedPath} does not exist.`)
    }
}

export async function compileWithRemix(sources: any, config: ResolcConfig): Promise<SolcOutput> {
    sources = resolveInputs(sources)

    const optimizationEnabled = config.settings.optimizer?.enabled;
    const runs = config.settings.optimizer?.runs;

    const body = {
        cmd: '--standard-json',
        input: JSON.stringify({
            language: 'Solidity',
            sources,
            settings: {
                optimizer: { enabled: !!optimizationEnabled , runs: runs ? runs : 200 },
                outputSelection: {
                    '*': {
                        '*': ['abi'],
                    },
                },
            },
        }),
    }

    const response = await fetch('https://remix-backend.polkadot.io/resolc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(`${response.statusText}: ${text}`)
    }

    return (await response.json()) as SolcOutput
}
