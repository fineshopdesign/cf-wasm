import init, { initStreaming, type Yoga } from 'yoga-wasm-web';

/** Initializes yoga asynchronously */
export async function initYoga(input: BufferSource | WebAssembly.Module | Response | Promise<Response>) {
  if (initYoga.promise) {
    throw new Error('(@cf-wasm/satori): Function already called. The `initYoga()` function can be used only once.');
  }
  if (!input) {
    throw new Error('(@cf-wasm/satori): Argument `input` is not valid.');
  }
  initYoga.promise = (async () => {
    initYoga.initialized = true;
    const resolved = await input;
    if (resolved instanceof Response) {
      return initStreaming(resolved);
    }
    return init(resolved);
  })();
  return initYoga.promise;
}

initYoga.promise = null as Promise<Yoga> | null;
/** Indicates whether satori is initialized */
initYoga.initialized = false;

/** Ensures yoga is initialized */
initYoga.ensure = async () => {
  if (!initYoga.promise) {
    throw new Error('(@cf-wasm/satori): Function not called. Call `initYoga()` function first.');
  }
  return initYoga.promise;
};

export default init;
export * from 'yoga-wasm-web';
