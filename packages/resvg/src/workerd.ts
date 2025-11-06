import resvgWasmModule from './lib/resvg.wasm';
import { initResvg } from './resvg';

initResvg(resvgWasmModule);

export { resvgWasmModule };
export * from './resvg';
