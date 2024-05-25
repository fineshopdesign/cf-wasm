import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { init } from '../core/resvg';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const wasmBinary = fs.readFileSync(path.resolve(dirname, '../core/resvg.wasm'));

const MODULE = new WebAssembly.Module(wasmBinary);

init(MODULE);

export { MODULE };
export {
  Resvg,
  type BBox,
  type RenderedImage,
  type ResvgRenderOptions,
} from '../core/resvg';
