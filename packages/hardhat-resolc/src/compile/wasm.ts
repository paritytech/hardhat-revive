import { SolcOutput } from "../types";
import { exec as execCb } from 'child_process';
import { promisify } from 'util';
import { compile, resolveInputs } from '@parity/revive';

const exec = promisify(execCb);

export async function compileWithWasm(sources: any): Promise<SolcOutput> {
    sources = resolveInputs(sources)

    const out = await compile(sources);

    return out;
}
