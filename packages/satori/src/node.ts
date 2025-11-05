import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { initSatori, satori } from './core/satori';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const yogaWasmBinary = fs.readFileSync(path.resolve(dirname, './core/yoga.wasm')).buffer;
const yogaWasmModule = new WebAssembly.Module(yogaWasmBinary);

initSatori(import('./core/yoga').then((module) => module.initYoga(yogaWasmModule)));

export default satori;
export { yogaWasmModule };
export {
  type Font,
  type FontStyle,
  type FontWeight,
  type Locale,
  type SatoriNode,
  type SatoriOptions,
  satori,
  type VNode,
} from './core/satori';
export { initYoga, type Yoga } from './core/yoga';
