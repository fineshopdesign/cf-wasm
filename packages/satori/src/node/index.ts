import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { initSatori, satori } from '../core/satori';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const wasmBinary = fs.readFileSync(path.resolve(dirname, '../core/yoga.wasm'));

const YOGA_MODULE = new WebAssembly.Module(wasmBinary);

initSatori(import('yoga-wasm-web').then((module) => module.default(YOGA_MODULE)));

export default satori;
export { YOGA_MODULE };
export {
  satori,
  type Font,
  type FontStyle,
  type FontWeight,
  type Locale,
  type SatoriNode,
  type SatoriOptions,
} from '../core/satori';
