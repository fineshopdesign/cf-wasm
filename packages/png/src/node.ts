import pngWasmBuffer from './lib/png_bg.wasm.inline';
import { initPng } from './png';

const pngWasmModule = new WebAssembly.Module(pngWasmBuffer);

initPng.sync(pngWasmModule);

export { pngWasmModule };
export * from './png';
