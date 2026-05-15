import pngWasmBuffer from './lib/png_bg.wasm.inline';
import { initPng } from './png';

const pngWasmModule = new WebAssembly.Module(pngWasmBuffer);

initPng.sync({ module: pngWasmModule });

export * from './png';
export { pngWasmModule };
