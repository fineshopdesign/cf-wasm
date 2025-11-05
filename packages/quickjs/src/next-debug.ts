import debugSyncWasmModule from './core/DEBUG_SYNC.wasm?module';
import { DEBUG_SYNC, newQuickJSWASMModuleFromVariant, newVariant, type QuickJSWASMModule } from './core/debug';

export const NextDebugSyncVariant = newVariant(DEBUG_SYNC, {
  wasmModule: debugSyncWasmModule,
  wasmSourceMapData: async () => fetch(new URL('./core/DEBUG_SYNC.wasm.map.txt', import.meta.url)).then((res) => res.text()),
});

let singletonPromise: Promise<QuickJSWASMModule> | undefined;

export async function getQuickJSWASMModule() {
  singletonPromise ??= newQuickJSWASMModuleFromVariant(NextDebugSyncVariant);
  return singletonPromise;
}

export { debugSyncWasmModule };
export * from './core/debug';
