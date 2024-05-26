import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import initAsync, { initSync } from '../png';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const wasmBinary = fs.readFileSync(path.resolve(dirname, '../lib/png_bg.wasm'));

const MODULE = new WebAssembly.Module(wasmBinary);

initSync(MODULE);

export { initAsync, MODULE };
export * from '../png';
