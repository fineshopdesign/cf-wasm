import initAsync, { type InitInput } from '../png';

/** Initializes png asynchronously */
export const initPng = async (input: InitInput | Promise<InitInput>) => {
  if (initPng.input) {
    throw new Error('Function already called. The `initPng()` function can be used only once.');
  }
  if (!input) {
    throw new Error('Invalid `input`. Provide valid `input`.');
  }
  initPng.input = input;
  const result = await initAsync(input);
  initPng.initialized = true;
  return result;
};
initPng.input = undefined as InitInput | Promise<InitInput> | undefined;
initPng.initialized = false;

export { initAsync };
export * from '../png';
