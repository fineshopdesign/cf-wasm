import { type InitInput, Resvg as ResvgClass, type ResvgRenderOptions, initWasm } from '@resvg/resvg-wasm-2.4.1';

export type InputParam = (() => InitInput | Promise<InitInput>) | InitInput | Promise<InitInput>;

/** Initializes resvg */
export const initResvg = (input: InputParam) => {
  if (initResvg.input) {
    throw new Error('Function already called. The `initResvg()` function can be used only once.');
  }
  if (!input) {
    throw new Error('Invalid `input`. Provide valid `input`.');
  }
  initResvg.input = input;
};

/** The input provided through function */
initResvg.input = undefined as InputParam | undefined;
/** Indicates whether resvg is initialized */
initResvg.initialized = false;

/** Ensures resvg is initialized */
initResvg.ensure = async () => {
  if (!initResvg.input) {
    throw new Error('Resvg is not yet initialized. Call `initResvg()` function first.');
  }
  if (!initResvg.initialized) {
    const input = (await (typeof initResvg.input === 'function' ? initResvg.input() : initResvg.input)) as InitInput | Promise<InitInput>;
    await initWasm(input);
    initResvg.initialized = true;
  }
};

export class Resvg extends ResvgClass {
  constructor(svg: Uint8Array | string, options?: ResvgRenderOptions) {
    if (!initResvg.initialized) {
      if (initResvg.input) {
        throw new Error(
          '`initResvg()` function was called, but Resvg is not yet initialized. Use `Resvg.create()` async static method instead to ensure Resvg is initialized.',
        );
      }
      throw new Error('Resvg is not yet initialized. Call `initResvg()` function first.');
    }
    super(svg, options);
  }

  public static async create(svg: string | Uint8Array, options?: ResvgRenderOptions) {
    await initResvg.ensure();
    return new Resvg(svg, options);
  }
}

export {
  initWasm,
  type BBox,
  type InitInput,
  type RenderedImage,
  type ResvgRenderOptions,
} from '@resvg/resvg-wasm-2.4.1';
