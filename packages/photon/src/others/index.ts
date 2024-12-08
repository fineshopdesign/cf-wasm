import '@cf-wasm/internals/polyfills/image-data';
import initAsync, { type InitInput } from '../lib/photon_rs';

/** Initializes photon asynchronously */
export const initPhoton = async (
  input:
    | {
        module_or_path: InitInput | Promise<InitInput>;
      }
    | InitInput
    | Promise<InitInput>,
) => {
  if (initPhoton.promise) {
    throw new Error('(@cf-wasm/photon): Function already called. The `initPhoton()` function can be used only once.');
  }
  if (!input) {
    throw new Error('(@cf-wasm/photon): Argument `input` is not valid.');
  }
  initPhoton.promise = (async () => {
    await initAsync(input);
    initPhoton.initialized = true;
  })();
  return initPhoton.promise;
};

initPhoton.promise = null as Promise<void> | null;
/** Indicates whether photon is initialized */
initPhoton.initialized = false;

/** Ensures photon is initialized */
initPhoton.ensure = async () => {
  if (!initPhoton.promise) {
    throw new Error('(@cf-wasm/photon): Function not called. Call `initPhoton()` function first.');
  }
  return initPhoton.promise;
};

export { initAsync };
export * from '../lib/photon_rs';
