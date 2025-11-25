import debugSyncWasmModule from './lib/DEBUG_SYNC.wasm?module';
import debugSyncWasmModuleSourceMap from './lib/DEBUG_SYNC.wasm.map.txt.inline';
import { DEBUG_SYNC, newQuickJSWASMModuleFromVariant, newVariant, type QuickJSWASMModule } from './lib/debug';

export const EdgeLightDebugSyncVariant = newVariant(DEBUG_SYNC, {
  wasmModule: debugSyncWasmModule,
  wasmSourceMapData: debugSyncWasmModuleSourceMap,
});

let singletonPromise: Promise<QuickJSWASMModule> | undefined;

export async function getQuickJSWASMModule() {
  singletonPromise ??= newQuickJSWASMModuleFromVariant(EdgeLightDebugSyncVariant);
  return singletonPromise;
}

export { debugSyncWasmModule };
export * from './lib/debug';
