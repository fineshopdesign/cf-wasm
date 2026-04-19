import pngWasmModule from './lib/png_bg.wasm';
import { initPng } from './png';

initPng.sync(pngWasmModule);

export * from './png';
export { pngWasmModule };
