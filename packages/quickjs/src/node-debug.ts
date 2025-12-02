import debugSyncWasmBuffer from './lib/DEBUG_SYNC.wasm.inline';
import debugSyncWasmModuleSourceMap from './lib/DEBUG_SYNC.wasm.map.txt.inline';
import { DEBUG_SYNC, newQuickJSWASMModuleFromVariant, newVariant, type QuickJSWASMModule } from './lib/debug';

const debugSyncWasmModule = new WebAssembly.Module(debugSyncWasmBuffer);

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
export * from './lib/debug';
