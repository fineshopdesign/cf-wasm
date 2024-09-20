import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { initSatori, satori } from '../core/satori';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const yogaWasmBinary = fs.readFileSync(path.resolve(dirname, '../core/yoga.wasm'));
const yogaWasmModule = new WebAssembly.Module(yogaWasmBinary);

initSatori(import('yoga-wasm-web').then((module) => module.default(yogaWasmModule)));

export default satori;
export { yogaWasmModule };
export {
  satori,
  type Font,
  type FontStyle,
  type FontWeight,
  type Locale,
  type SatoriNode,
  type SatoriOptions,
  type VNode,
} from '../core/satori';
