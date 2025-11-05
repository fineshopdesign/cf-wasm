import releaseSyncWasmModule from './core/RELEASE_SYNC.wasm?module';
import { newQuickJSWASMModuleFromVariant, newVariant, type QuickJSWASMModule, RELEASE_SYNC } from './core/release';

export const NextReleaseSyncVariant = newVariant(RELEASE_SYNC, {
  wasmModule: releaseSyncWasmModule,
});

let singletonPromise: Promise<QuickJSWASMModule> | undefined;

export async function getQuickJSWASMModule() {
  singletonPromise ??= newQuickJSWASMModuleFromVariant(NextReleaseSyncVariant);
  return singletonPromise;
}

export { releaseSyncWasmModule };
export * from './core/release';
