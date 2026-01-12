import debugSyncWasmModule from './lib/DEBUG_SYNC.wasm';
import debugSyncWasmModuleSourceMap from './lib/DEBUG_SYNC.wasm.map.txt.inline';
import { DEBUG_SYNC, newQuickJSWASMModuleFromVariant, newVariant, type QuickJSWASMModule } from './lib/debug';

export const WorkerdDebugSyncVariant = newVariant(DEBUG_SYNC, {
  wasmModule: debugSyncWasmModule,
  wasmSourceMapData: debugSyncWasmModuleSourceMap,
});

let singletonPromise: Promise<QuickJSWASMModule> | undefined;

export async function getQuickJSWASMModule() {
  singletonPromise ??= newQuickJSWASMModuleFromVariant(WorkerdDebugSyncVariant);
  return singletonPromise;
}

export { debugSyncWasmModule, debugSyncWasmModuleSourceMap };
export * from './lib/debug';
