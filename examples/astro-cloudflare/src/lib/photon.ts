import { initPhoton } from '@cf-wasm/photon/others';
import photonWasmModule from '@cf-wasm/photon/photon.wasm?module';

if (!initPhoton.initialized) {
  initPhoton.sync({ module: photonWasmModule });
}

export * from '@cf-wasm/photon/others';
