import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import { compile, resolveInputs } from '@parity/revive';
import type { SolcOutput } from "@parity/revive";

const exec = promisify(execCb);

export async function compileWithNpm(sources: any): Promise<SolcOutput> {
    sources = resolveInputs(sources);

    const out = compile(sources);

    return out;
}
