import { DEBUG_SYNC, type QuickJSWASMModule, newQuickJSWASMModule, newVariant } from '../core';
import debugSyncWasmModule from '../core/DEBUG_SYNC.wasm';
import debugSyncWasmModuleSourceMap from '../core/DEBUG_SYNC.wasm.map.txt';

export const WorkerdDebugSyncVariant = newVariant(DEBUG_SYNC, {
  wasmModule: debugSyncWasmModule,
  wasmSourceMapData: debugSyncWasmModuleSourceMap,
});

let QuickJS: QuickJSWASMModule;

export const getQuickJSWASMModule = async () => {
  QuickJS ??= await newQuickJSWASMModule(WorkerdDebugSyncVariant);
  return QuickJS;
};

export { debugSyncWasmModule, debugSyncWasmModuleSourceMap };
export * from 'quickjs-emscripten';
