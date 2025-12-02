import minifyHTMLWasmBuffer from './lib/index_bg.wasm.inline';
import { initMinifyHTML } from './minify-html';

const minifyHTMLWasmModule = new WebAssembly.Module(minifyHTMLWasmBuffer);

initMinifyHTML.sync(minifyHTMLWasmModule);

export { minifyHTMLWasmModule };
export * from './minify-html';
