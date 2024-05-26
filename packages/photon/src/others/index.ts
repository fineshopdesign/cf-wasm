import initAsync, { type InitInput } from '../lib/photon_rs';

/** Initializes photon asynchronously */
export const initPhoton = async (input: InitInput | Promise<InitInput>) => {
  if (initPhoton.input) {
    throw new Error('Function already called. The `initPhoton()` function can be used only once.');
  }
  if (!input) {
    throw new Error('Invalid `input`. Provide valid `input`.');
  }
  initPhoton.input = input;
  const result = await initAsync(input);
  initPhoton.initialized = true;
  return result;
};
initPhoton.input = undefined as InitInput | Promise<InitInput> | undefined;
initPhoton.initialized = false;

export { initAsync };
export * from '../lib/photon_rs';
