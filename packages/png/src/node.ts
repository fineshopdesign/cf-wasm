import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import initAsync, { initSync } from './png';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const pngWasmBinary = fs.readFileSync(path.resolve(dirname, './lib/png_bg.wasm'));
const pngWasmModule = new WebAssembly.Module(pngWasmBinary);

initSync(pngWasmModule);

export { initAsync, pngWasmModule };
export * from './png';
