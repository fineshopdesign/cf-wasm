import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { initMinifyHTML } from './minify-html';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const minifyHTMLWasmBinary = fs.readFileSync(path.resolve(dirname, './lib/index_bg.wasm'));
const minifyHTMLWasmModule = new WebAssembly.Module(minifyHTMLWasmBinary);

initMinifyHTML.sync(minifyHTMLWasmModule);

export { minifyHTMLWasmModule };
export * from './minify-html';
