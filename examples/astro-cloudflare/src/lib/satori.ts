import { initSatori, initYoga } from '@cf-wasm/satori/others';
import yogaWasmModule from '@cf-wasm/satori/yoga.wasm?module';

if (!initSatori.initialized) {
  initSatori(initYoga(yogaWasmModule));
}

export * from '@cf-wasm/satori/others';
