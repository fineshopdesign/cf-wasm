import resvgWasmModule from './lib/resvg.wasm?module';
import { initResvg } from './resvg';

initResvg(resvgWasmModule);

export * from './resvg';
export { resvgWasmModule };
