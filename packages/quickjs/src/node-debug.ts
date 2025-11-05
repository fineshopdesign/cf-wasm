import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { DEBUG_SYNC, newQuickJSWASMModuleFromVariant, newVariant, type QuickJSWASMModule } from './core/debug';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const debugSyncWasmBinary = fs.readFileSync(path.resolve(dirname, './core/DEBUG_SYNC.wasm'));
const debugSyncWasmModule = new WebAssembly.Module(debugSyncWasmBinary);
const debugSyncWasmModuleSourceMap = fs.readFileSync(path.resolve(dirname, './core/DEBUG_SYNC.wasm.map.txt'), 'utf-8');

export const NodeDebugSyncVariant = newVariant(DEBUG_SYNC, {
  wasmModule: debugSyncWasmModule,
  wasmSourceMapData: debugSyncWasmModuleSourceMap,
});

let singletonPromise: Promise<QuickJSWASMModule> | undefined;

export async function getQuickJSWASMModule() {
  singletonPromise ??= newQuickJSWASMModuleFromVariant(NodeDebugSyncVariant);
  return singletonPromise;
}

export { debugSyncWasmModule, debugSyncWasmModuleSourceMap };
export * from './core/debug';
