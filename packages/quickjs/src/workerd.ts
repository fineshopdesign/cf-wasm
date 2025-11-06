import releaseSyncWasmModule from './lib/RELEASE_SYNC.wasm';
import { newQuickJSWASMModuleFromVariant, newVariant, type QuickJSWASMModule, RELEASE_SYNC } from './lib/release';

export const WorkerdReleaseSyncVariant = newVariant(RELEASE_SYNC, {
  wasmModule: releaseSyncWasmModule,
});

let singletonPromise: Promise<QuickJSWASMModule> | undefined;

export async function getQuickJSWASMModule() {
  singletonPromise ??= newQuickJSWASMModuleFromVariant(WorkerdReleaseSyncVariant);
  return singletonPromise;
}

export { releaseSyncWasmModule };
export * from './lib/release';
