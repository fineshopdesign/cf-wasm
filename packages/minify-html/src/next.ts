import minifyHTMLWasmModule from './lib/index_bg.wasm?module';
import { initMinifyHTML } from './minify-html';

initMinifyHTML.sync(minifyHTMLWasmModule);

export { minifyHTMLWasmModule };
export * from './minify-html';
