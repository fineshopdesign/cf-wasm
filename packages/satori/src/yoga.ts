import init, { initStreaming, type Yoga } from 'yoga-wasm-web';

/** Initializes yoga asynchronously */
export async function initYoga(input: BufferSource | WebAssembly.Module | Response | Promise<Response>) {
  if (initYoga.initialized) {
    throw new Error('(@cf-wasm/satori): Function already called. The `initYoga()` function can be used only once.');
  }
  if (!input) {
    throw new Error('(@cf-wasm/satori): Argument `input` is not valid.');
  }
  initYoga.initialized = true;
  initYoga.promise = (async () => {
    const resolvedInput = await input;
    const yoga = resolvedInput instanceof Response ? await initStreaming(resolvedInput) : await init(resolvedInput);
    initYoga.ready = true;
    return yoga;
  })();
  return initYoga.promise;
}

initYoga.promise = null as Promise<Yoga> | null;
/** Indicates whether yoga is initialized */
initYoga.initialized = false;
/** Indicates whether yoga is ready */
initYoga.ready = false;

/** Ensures yoga is ready */
initYoga.ensure = async () => {
  if (!initYoga.promise) {
    throw new Error('(@cf-wasm/satori): Function not called. Call `initYoga()` function first.');
  }
  return initYoga.promise;
};

export * from 'yoga-wasm-web';
