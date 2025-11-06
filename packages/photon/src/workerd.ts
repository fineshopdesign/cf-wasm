import photonWasmModule from './lib/photon_rs_bg.wasm';
import { initPhoton } from './photon';

initPhoton.sync({ module: photonWasmModule });

export { photonWasmModule };
export * from './photon';
