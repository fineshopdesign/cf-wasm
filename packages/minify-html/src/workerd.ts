import minifyHTMLWasmModule from './lib/index_bg.wasm';
import { initMinifyHTML } from './minify-html';

initMinifyHTML.sync(minifyHTMLWasmModule);

export { minifyHTMLWasmModule };
export * from './minify-html';
