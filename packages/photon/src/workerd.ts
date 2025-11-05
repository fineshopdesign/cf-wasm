import '@cf-wasm/internals/polyfills/image-data';
import initAsync, { initSync } from './lib/photon_rs';
import photonWasmModule from './lib/photon_rs_bg.wasm';

initSync({ module: photonWasmModule });

export { initAsync, photonWasmModule };
export * from './lib/photon_rs';
