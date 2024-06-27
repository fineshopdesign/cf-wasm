import { DEBUG_SYNC, type QuickJSWASMModule, newQuickJSWASMModule, newVariant } from '../core';
import debugSyncWasmModule from '../core/DEBUG_SYNC.wasm?module';

export const NextDebugSyncVariant = newVariant(DEBUG_SYNC, {
  wasmModule: debugSyncWasmModule,
  wasmSourceMapData: async () => fetch(new URL('../core/DEBUG_SYNC.wasm.map.txt', import.meta.url)).then((res) => res.text()),
});

let QuickJS: QuickJSWASMModule | undefined;

export const getQuickJSWASMModule = async () => {
  QuickJS ??= await newQuickJSWASMModule(NextDebugSyncVariant);
  return QuickJS;
};

export { debugSyncWasmModule };
export * from 'quickjs-emscripten';
