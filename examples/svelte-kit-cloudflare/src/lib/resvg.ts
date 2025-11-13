import { initResvg } from '@cf-wasm/resvg/legacy/others';
import resvgWasmModule from '@cf-wasm/resvg/legacy/resvg.wasm?module';

if (!initResvg.initialized) {
  initResvg(resvgWasmModule);
}

export * from '@cf-wasm/resvg/legacy/others';
