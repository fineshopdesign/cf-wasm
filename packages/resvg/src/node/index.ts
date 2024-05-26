import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { initResvg } from '../core/resvg';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const wasmBinary = fs.readFileSync(path.resolve(dirname, '../core/resvg.wasm'));

const MODULE = new WebAssembly.Module(wasmBinary);

initResvg(MODULE);

export { MODULE };
export {
  Resvg,
  type ResvgRenderOptions,
  type CustomFontsOptions,
  type FontOptions,
  type SystemFontsOptions,
} from '../core/resvg';
