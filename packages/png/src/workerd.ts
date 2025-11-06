import pngWasmModule from './lib/png_bg.wasm';
import { initPng } from './png';

initPng.sync(pngWasmModule);

export { pngWasmModule };
export * from './png';
