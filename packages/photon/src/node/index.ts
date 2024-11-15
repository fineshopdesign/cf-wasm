import '@cf-wasm/internals/polyfills/image-data';
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import initAsync, { initSync } from '../lib/photon_rs';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const photonWasmBinary = fs.readFileSync(path.resolve(dirname, '../lib/photon_rs_bg.wasm'));
const photonWasmModule = new WebAssembly.Module(photonWasmBinary);

initSync({ module: photonWasmModule });

export { initAsync, photonWasmModule };
export * from '../lib/photon_rs';
