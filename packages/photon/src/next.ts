import photonWasmModule from './lib/photon_rs_bg.wasm?module';
import { initPhoton } from './photon';

initPhoton.sync({ module: photonWasmModule });

export { photonWasmModule };
export * from './lib/photon_rs';
