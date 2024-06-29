import { initResvg } from '../core/resvg';
import resvgWasmModule from '../core/resvg.wasm';

initResvg(resvgWasmModule);

export { resvgWasmModule };
export {
  Resvg,
  type BBox,
  type RenderedImage,
  type ResvgRenderOptions,
} from '../core/resvg';
