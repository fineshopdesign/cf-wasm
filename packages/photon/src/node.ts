import photonWasmBuffer from './lib/photon_rs_bg.wasm.inline';
import { initPhoton } from './photon';

const photonWasmModule = new WebAssembly.Module(photonWasmBuffer);

initPhoton.sync({ module: photonWasmModule });

export * from './photon';
export { photonWasmModule };
