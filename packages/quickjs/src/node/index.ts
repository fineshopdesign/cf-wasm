import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { type QuickJSWASMModule, RELEASE_SYNC, newQuickJSWASMModule, newVariant } from '../core';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const releaseSyncWasmBinary = fs.readFileSync(path.resolve(dirname, '../core/RELEASE_SYNC.wasm'));
const releaseSyncWasmModule = new WebAssembly.Module(releaseSyncWasmBinary);

export const NodeReleaseSyncVariant = newVariant(RELEASE_SYNC, {
  wasmModule: releaseSyncWasmModule,
});

let QuickJS: QuickJSWASMModule;

export const getQuickJSWASMModule = async () => {
  QuickJS ??= await newQuickJSWASMModule(NodeReleaseSyncVariant);
  return QuickJS;
};

export { releaseSyncWasmModule };
export * from 'quickjs-emscripten';
