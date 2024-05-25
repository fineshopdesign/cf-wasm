import { init } from '../core/resvg';
import MODULE from '../core/resvg.wasm';

init(MODULE);

export { MODULE };
export {
  Resvg,
  type BBox,
  type RenderedImage,
  type ResvgRenderOptions,
} from '../core/resvg';
