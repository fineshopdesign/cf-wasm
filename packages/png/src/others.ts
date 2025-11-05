import type { InitInput } from './lib/png';
import initAsync from './png';

/** Initializes png asynchronously */
export async function initPng(input: InitInput | Promise<InitInput>) {
  if (initPng.promise) {
    throw new Error('(@cf-wasm/png): Function already called. The `initPng()` function can be used only once.');
  }
  if (!input) {
    throw new Error('(@cf-wasm/png): Argument `input` is not valid.');
  }
  initPng.promise = (async () => {
    await initAsync(input);
    initPng.initialized = true;
  })();
  return initPng.promise;
}

initPng.promise = null as Promise<void> | null;
/** Indicates whether png is initialized */
initPng.initialized = false;

/** Ensures png is initialized */
initPng.ensure = async () => {
  if (!initPng.promise) {
    throw new Error('(@cf-wasm/png): Function not called. Call `initPng()` function first.');
  }
  return initPng.promise;
};

export { initAsync };
export * from './png';
