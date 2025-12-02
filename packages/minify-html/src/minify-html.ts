import type { MinifyOptions } from './lib/index_bg';
import * as lib from './lib/index_bg';

const { __wbg_set_wasm, minify: wasmMinify, ...__wbg } = lib;

const imports = { './index_bg.js': __wbg };

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export type SyncInitInput = WebAssembly.Module;

async function loadWasm(input: InitInput, imports: WebAssembly.Imports): Promise<WebAssembly.WebAssemblyInstantiatedSource> {
  let source: Response | BufferSource | WebAssembly.Module = input;

  if (
    typeof source === 'string' ||
    (typeof Request === 'function' && source instanceof Request) ||
    (typeof URL === 'function' && source instanceof URL)
  ) {
    source = await fetch(source);
  }

  if (typeof Response === 'function' && source instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === 'function') {
      try {
        return await WebAssembly.instantiateStreaming(source, imports);
      } catch (e) {
        if (source.headers.get('Content-Type') !== 'application/wasm') {
          console.warn(
            '`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n',
            e,
          );
        }
      }
    }

    const bytes = await source.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  }

  const instantiated = (await WebAssembly.instantiate(source, imports)) as WebAssembly.Instance | WebAssembly.WebAssemblyInstantiatedSource;

  if (instantiated instanceof WebAssembly.Instance) {
    return { instance: instantiated, module: source as WebAssembly.Module };
  }

  return instantiated;
}

async function initAsync(input: InitInput | Promise<InitInput>) {
  const { instance } = await loadWasm(await input, imports);
  __wbg_set_wasm(instance.exports);
}

function initSync(input: SyncInitInput) {
  const instance = new WebAssembly.Instance(input, imports);
  __wbg_set_wasm(instance.exports);
}

/** Initializes minify-html asynchronously */
export async function initMinifyHTML(input: InitInput | Promise<InitInput>): Promise<void> {
  if (initMinifyHTML.initialized) {
    throw new Error('(@cf-wasm/minify-html): Function already called. The `initMinifyHTML()` function can be used only once.');
  }
  if (!input) {
    throw new Error('(@cf-wasm/minify-html): Argument `input` is not valid.');
  }
  initMinifyHTML.initialized = true;
  initMinifyHTML.promise = (async () => {
    await initAsync(input);
    initMinifyHTML.ready = true;
  })();
  return initMinifyHTML.promise;
}

/** Initializes minify-html synchronously */
initMinifyHTML.sync = (input: SyncInitInput): void => {
  if (initMinifyHTML.initialized) {
    throw new Error('(@cf-wasm/minify-html): Function already called. The `initMinifyHTML()` function can be used only once.');
  }
  if (!input) {
    throw new Error('(@cf-wasm/minify-html): Argument `input` is not valid.');
  }
  initMinifyHTML.initialized = true;
  initSync(input);
  initMinifyHTML.promise = Promise.resolve(undefined);
  initMinifyHTML.ready = true;
};

initMinifyHTML.promise = null as Promise<void> | null;
/** Indicates whether minify-html is initialized */
initMinifyHTML.initialized = false;
/** Indicates whether minify-html is ready */
initMinifyHTML.ready = false;

/** Ensures minify-html is ready */
initMinifyHTML.ensure = async () => {
  if (!initMinifyHTML.promise) {
    throw new Error('(@cf-wasm/minify-html): Function not called. Call `initMinifyHTML()` function first.');
  }
  return initMinifyHTML.promise;
};

/** Minifies UTF-8 HTML code, represented as an array of bytes.
 *
 * @param code A slice of bytes representing the source code to minify.
 * @param options Configuration object to adjust minification approach.
 *
 * @example
 * ```ts
 * import { minify, type MinifyOptions } from "@cf-wasm/minify/workerd";
 *
 * const encoder = new TextEncoder();
 * const decoder = new TextDecoder();
 *
 * const code = encoder.encode("<p>  Hello, world!  </p>");
 * const options: MinifyOptions = {
 *   keep_comments: true
 * };
 *
 * const minified = decoder.decode(minify(code, options)); // minified === "<p>Hello, world!"
 * ```
 */
export function minify(code: Uint8Array, options: MinifyOptions = {}) {
  if (!initMinifyHTML.ready) {
    if (initMinifyHTML.initialized) {
      throw new Error(
        '(@cf-wasm/minify-html): minify-html is not yet ready while `initMinifyHTML()` function was called. Use `minify.async()` async method instead to ensure minify-html is ready.',
      );
    }
    throw new Error('(@cf-wasm/minify-html): minify-html is not yet initialized. Call `initMinifyHTML()` function first.');
  }

  return wasmMinify(code, options);
}

minify.async = async (code: Uint8Array, options: MinifyOptions = {}) => {
  await initMinifyHTML.ensure();
  return wasmMinify(code, options);
};

export type { MinifyOptions };
