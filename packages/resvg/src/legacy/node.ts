import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { initResvg } from './resvg';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const resvgWasmBinary = fs.readFileSync(path.resolve(dirname, './lib/resvg.wasm'));
const resvgWasmModule = new WebAssembly.Module(resvgWasmBinary);

initResvg(resvgWasmModule);

export { resvgWasmModule };
export * from './resvg';
