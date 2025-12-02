import resvgWasmBuffer from './lib/resvg.wasm.inline';
import { initResvg } from './resvg';

const resvgWasmModule = new WebAssembly.Module(resvgWasmBuffer);

initResvg(resvgWasmModule);

export { resvgWasmModule };
export * from './resvg';
