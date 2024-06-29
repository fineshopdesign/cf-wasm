import pngWasmModule from '../lib/png_bg.wasm';
import initAsync, { initSync } from '../png';

initSync(pngWasmModule);

export { initAsync, pngWasmModule };
export * from '../png';
