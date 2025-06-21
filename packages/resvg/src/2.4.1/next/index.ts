import { initResvg } from '../core/resvg';
import resvgWasmModule from '../core/resvg.wasm?module';

initResvg(resvgWasmModule);

export { resvgWasmModule };
export {
  type BBox,
  type RenderedImage,
  Resvg,
  type ResvgRenderOptions,
} from '../core/resvg';
