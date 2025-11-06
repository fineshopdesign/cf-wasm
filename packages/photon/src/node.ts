import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { initPhoton } from './photon';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const photonWasmBinary = fs.readFileSync(path.resolve(dirname, './lib/photon_rs_bg.wasm'));
const photonWasmModule = new WebAssembly.Module(photonWasmBinary);

initPhoton.sync({ module: photonWasmModule });

export { photonWasmModule };
export * from './photon';
