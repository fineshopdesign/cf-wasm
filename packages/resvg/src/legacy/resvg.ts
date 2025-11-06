import { type InitInput, initWasm, Resvg as ResvgClass, type ResvgRenderOptions } from '@resvg/resvg-wasm-legacy';

/** Initializes resvg asynchronously */
export async function initResvg(input: InitInput | Promise<InitInput>) {
  if (initResvg.initialized) {
    throw new Error('(@cf-wasm/resvg/legacy): Function already called. The `initResvg()` function can be used only once.');
  }
  if (!input) {
    throw new Error('(@cf-wasm/resvg/legacy): Argument `input` is not valid.');
  }
  initResvg.initialized = true;
  initResvg.promise = (async () => {
    await initWasm(await input);
    initResvg.ready = true;
  })();
  return initResvg.promise;
}

initResvg.promise = null as Promise<void> | null;
/** Indicates whether resvg is initialized */
initResvg.initialized = false;
/** Indicates whether resvg is ready */
initResvg.ready = false;

/** Ensures resvg is ready */
initResvg.ensure = async () => {
  if (!initResvg.promise) {
    throw new Error('(@cf-wasm/resvg/legacy): Function not called. Call `initResvg()` function first.');
  }
  return initResvg.promise;
};

export class Resvg extends ResvgClass {
  constructor(svg: Uint8Array | string, options?: ResvgRenderOptions) {
    if (!initResvg.ready) {
      if (initResvg.initialized) {
        throw new Error(
          '(@cf-wasm/resvg/legacy): Resvg is not yet ready while `initResvg()` function was called. Use `Resvg.create()` async static method instead to ensure Resvg is ready.',
        );
      }
      throw new Error('(@cf-wasm/resvg/legacy): Resvg is not yet initialized. Call `initResvg()` function first.');
    }
    super(svg, options);
  }

  public static async create(svg: string | Uint8Array, options?: ResvgRenderOptions) {
    await initResvg.ensure();
    return new Resvg(svg, options);
  }
}

export type {
  BBox,
  InitInput,
  RenderedImage,
  ResvgRenderOptions,
} from '@resvg/resvg-wasm-legacy';
