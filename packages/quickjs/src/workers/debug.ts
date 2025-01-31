import debugSyncWasmModule from '../core/DEBUG_SYNC.wasm';
import debugSyncWasmModuleSourceMap from '../core/DEBUG_SYNC.wasm.map.txt';
import { DEBUG_SYNC, type QuickJSWASMModule, newQuickJSWASMModuleFromVariant, newVariant } from '../core/debug';

export const WorkerdDebugSyncVariant = newVariant(DEBUG_SYNC, {
  wasmModule: debugSyncWasmModule,
  wasmSourceMapData: debugSyncWasmModuleSourceMap,
});

let singletonPromise: Promise<QuickJSWASMModule> | undefined;

export const getQuickJSWASMModule = async () => {
  singletonPromise ??= newQuickJSWASMModuleFromVariant(WorkerdDebugSyncVariant);
  return singletonPromise;
};

export { debugSyncWasmModule, debugSyncWasmModuleSourceMap };
export * from '../core/debug';
