import releaseSyncWasmBuffer from './lib/RELEASE_SYNC.wasm.inline';
import { newQuickJSWASMModuleFromVariant, newVariant, type QuickJSWASMModule, RELEASE_SYNC } from './lib/release';

const releaseSyncWasmModule = new WebAssembly.Module(releaseSyncWasmBuffer);

export const NodeReleaseSyncVariant = newVariant(RELEASE_SYNC, {
  wasmModule: releaseSyncWasmModule,
});

let singletonPromise: Promise<QuickJSWASMModule> | undefined;

export async function getQuickJSWASMModule() {
  singletonPromise ??= newQuickJSWASMModuleFromVariant(NodeReleaseSyncVariant);
  return singletonPromise;
}

export { releaseSyncWasmModule };
export * from './lib/release';
