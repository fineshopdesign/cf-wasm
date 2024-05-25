import { type InitInput, Resvg as ResvgClass, type ResvgRenderOptions, initWasm } from '@resvg/resvg-wasm-2.4.1';

export const init = (input: InitInput | Promise<InitInput>) => {
  if (init.input) {
    throw new Error('Already initialized. The `init()` function can be used only once.');
  }
  if (!input) {
    throw new Error('Provide a valid `input`');
  }
  init.input = input;
};
init.input = undefined as InitInput | Promise<InitInput> | undefined;

const ensureInit = async () => {
  if (!init.input) {
    throw new Error('Call `init()` function first.');
  }
  if (!ensureInit.initialized) {
    await initWasm(init.input);
    ensureInit.initialized = true;
  }
};
ensureInit.initialized = false;

// biome-ignore lint/complexity/noStaticOnlyClass: we are extending resvg original class
export class Resvg extends ResvgClass {
  public static async create(svg: string | Uint8Array, options?: ResvgRenderOptions) {
    await ensureInit();
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
