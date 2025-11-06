import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { initSatori, satori } from './satori';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const yogaWasmBinary = fs.readFileSync(path.resolve(dirname, './lib/yoga.wasm')).buffer;
const yogaWasmModule = new WebAssembly.Module(yogaWasmBinary);

initSatori(import('./yoga').then((module) => module.initYoga(yogaWasmModule)));

export default satori;
export { yogaWasmModule };
export * from './satori';
export { initYoga, type Yoga } from './yoga';
