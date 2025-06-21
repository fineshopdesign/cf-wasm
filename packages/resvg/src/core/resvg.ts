import { type InitInput, initWasm, Resvg as ResvgClass, type ResvgRenderOptions } from '@resvg/resvg-wasm';

/** Initializes resvg asynchronously */
export const initResvg = (input: InitInput | Promise<InitInput>) => {
  if (initResvg.promise) {
    throw new Error('(@cf-wasm/resvg): Function already called. The `initResvg()` function can be used only once.');
  }
  if (!input) {
    throw new Error('(@cf-wasm/resvg): Argument `input` is not valid.');
  }
  initResvg.promise = (async () => {
    await initWasm(input);
    initResvg.initialized = true;
  })();
  return initResvg.promise;
};

initResvg.promise = null as Promise<void> | null;
/** Indicates whether resvg is initialized */
initResvg.initialized = false;

/** Ensures resvg is initialized */
initResvg.ensure = async () => {
  if (!initResvg.promise) {
    throw new Error('(@cf-wasm/resvg): Function not called. Call `initResvg()` function first.');
  }
  return initResvg.promise;
};

export class Resvg extends ResvgClass {
  constructor(svg: Uint8Array | string, options?: ResvgRenderOptions) {
    if (!initResvg.initialized) {
      if (initResvg.promise) {
        throw new Error(
          '(@cf-wasm/resvg): Resvg is not yet initialized while `initResvg()` function was called. Use `Resvg.create()` async static method instead to ensure Resvg is initialized.',
        );
      }
      throw new Error('(@cf-wasm/resvg): Resvg is not yet initialized. Call `initResvg()` function first.');
    }
    super(svg, options);
  }

  public static async create(svg: string | Uint8Array, options?: ResvgRenderOptions) {
    await initResvg.ensure();
    return new Resvg(svg, options);
  }
}

export {
  type CustomFontsOptions,
  type FontOptions,
  type InitInput,
  initWasm,
  type ResvgRenderOptions,
  type SystemFontsOptions,
} from '@resvg/resvg-wasm';
