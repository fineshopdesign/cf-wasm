import { type QuickJSWASMModule, RELEASE_SYNC, newQuickJSWASMModule, newVariant } from '../core';
import releaseSyncWasmModule from '../core/RELEASE_SYNC.wasm?module';

export const NextReleaseSyncVariant = newVariant(RELEASE_SYNC, {
  wasmModule: releaseSyncWasmModule,
});

let QuickJS: QuickJSWASMModule | undefined;

export const getQuickJSWASMModule = async () => {
  QuickJS ??= await newQuickJSWASMModule(NextReleaseSyncVariant);
  return QuickJS;
};

export { releaseSyncWasmModule };
export * from 'quickjs-emscripten';
