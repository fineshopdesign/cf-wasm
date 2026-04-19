import pngWasmModule from './lib/png_bg.wasm?module';
import { initPng } from './png';

initPng.sync(pngWasmModule);

export * from './png';
export { pngWasmModule };
