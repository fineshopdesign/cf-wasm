import { type QuickJSWASMModule, RELEASE_SYNC, newQuickJSWASMModule, newVariant } from '../core';
import releaseSyncWasmModule from '../core/RELEASE_SYNC.wasm';

export const WorkerdReleaseSyncVariant = newVariant(RELEASE_SYNC, {
  wasmModule: releaseSyncWasmModule,
});

let QuickJS: QuickJSWASMModule;

export const getQuickJSWASMModule = async () => {
  QuickJS ??= await newQuickJSWASMModule(WorkerdReleaseSyncVariant);
  return QuickJS;
};

export { releaseSyncWasmModule };
export * from 'quickjs-emscripten';
