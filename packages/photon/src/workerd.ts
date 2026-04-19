import photonWasmModule from './lib/photon_rs_bg.wasm';
import { initPhoton } from './photon';

initPhoton.sync({ module: photonWasmModule });

export * from './photon';
export { photonWasmModule };
