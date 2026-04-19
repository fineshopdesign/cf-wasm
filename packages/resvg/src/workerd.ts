import resvgWasmModule from './lib/resvg.wasm';
import { initResvg } from './resvg';

initResvg(resvgWasmModule);

export * from './resvg';
export { resvgWasmModule };
