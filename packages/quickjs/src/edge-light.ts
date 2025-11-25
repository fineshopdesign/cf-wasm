import releaseSyncWasmModule from './lib/RELEASE_SYNC.wasm?module';
import { newQuickJSWASMModuleFromVariant, newVariant, type QuickJSWASMModule, RELEASE_SYNC } from './lib/release';

export const EdgeLightReleaseSyncVariant = newVariant(RELEASE_SYNC, {
  wasmModule: releaseSyncWasmModule,
});

let singletonPromise: Promise<QuickJSWASMModule> | undefined;

export async function getQuickJSWASMModule() {
  singletonPromise ??= newQuickJSWASMModuleFromVariant(EdgeLightReleaseSyncVariant);
  return singletonPromise;
}

export { releaseSyncWasmModule };
export * from './lib/release';
