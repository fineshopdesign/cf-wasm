import releaseSyncWasmModule from '../core/RELEASE_SYNC.wasm?module';
import { type QuickJSWASMModule, RELEASE_SYNC, newQuickJSWASMModuleFromVariant, newVariant } from '../core/release';

export const NextReleaseSyncVariant = newVariant(RELEASE_SYNC, {
  wasmModule: releaseSyncWasmModule,
});

let singletonPromise: Promise<QuickJSWASMModule> | undefined;

export const getQuickJSWASMModule = async () => {
  singletonPromise ??= newQuickJSWASMModuleFromVariant(NextReleaseSyncVariant);
  return singletonPromise;
};

export { releaseSyncWasmModule };
export * from '../core/release';
