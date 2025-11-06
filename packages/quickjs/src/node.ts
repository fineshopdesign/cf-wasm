import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { newQuickJSWASMModuleFromVariant, newVariant, type QuickJSWASMModule, RELEASE_SYNC } from './lib/release';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const releaseSyncWasmBinary = fs.readFileSync(path.resolve(dirname, './lib/RELEASE_SYNC.wasm'));
const releaseSyncWasmModule = new WebAssembly.Module(releaseSyncWasmBinary);

export const NodeReleaseSyncVariant = newVariant(RELEASE_SYNC, {
  wasmModule: releaseSyncWasmModule,
});

let singletonPromise: Promise<QuickJSWASMModule> | undefined;

export async function getQuickJSWASMModule() {
  singletonPromise ??= newQuickJSWASMModuleFromVariant(NodeReleaseSyncVariant);
  return singletonPromise;
}

export { releaseSyncWasmModule };
export * from './lib/release';
