import resvgWasmModule from './lib/resvg.wasm?module';
import { initResvg } from './resvg';

initResvg(resvgWasmModule);

export { resvgWasmModule };
export * from './resvg';
