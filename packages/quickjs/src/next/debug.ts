import debugSyncWasmModule from '../core/DEBUG_SYNC.wasm?module';
import { DEBUG_SYNC, type QuickJSWASMModule, newQuickJSWASMModuleFromVariant, newVariant } from '../core/debug';

export const NextDebugSyncVariant = newVariant(DEBUG_SYNC, {
  wasmModule: debugSyncWasmModule,
  wasmSourceMapData: async () => fetch(new URL('../core/DEBUG_SYNC.wasm.map.txt', import.meta.url)).then((res) => res.text()),
});

let singletonPromise: Promise<QuickJSWASMModule> | undefined;

export const getQuickJSWASMModule = async () => {
  singletonPromise ??= newQuickJSWASMModuleFromVariant(NextDebugSyncVariant);
  return singletonPromise;
};

export { debugSyncWasmModule };
export * from '../core/debug';
