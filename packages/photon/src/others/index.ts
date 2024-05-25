import initAsync, { type InitInput } from '../lib/photon_rs';

/** Initializes Photon asynchronously */
export const initPhoton = async (input: InitInput | Promise<InitInput>) => {
  if (initPhoton.initialized) {
    throw new Error('Already initialized. The `initPhoton()` function can be used only once.');
  }
  initPhoton.initialized = true;
  await initAsync(input);
};
initPhoton.initialized = false;

export { initAsync };
export * from '../lib/photon_rs';
