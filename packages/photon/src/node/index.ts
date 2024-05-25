import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import initAsync, { initSync } from '../lib/photon_rs';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const wasmBinary = fs.readFileSync(path.resolve(dirname, '../lib/photon_rs_bg.wasm'));

const MODULE = new WebAssembly.Module(wasmBinary);

initSync(MODULE);

export { initAsync, MODULE };
export * from '../lib/photon_rs';
