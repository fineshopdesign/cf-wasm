import pngWasmModule from './lib/png_bg.wasm?module';
import { initPng } from './png';

initPng.sync(pngWasmModule);

export { pngWasmModule };
export * from './png';
