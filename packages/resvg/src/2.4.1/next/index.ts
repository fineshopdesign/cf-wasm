import { init } from '../core/resvg';
import MODULE from '../core/resvg.wasm?module';

init(MODULE);

export { MODULE };
export {
  Resvg,
  type BBox,
  type RenderedImage,
  type ResvgRenderOptions,
} from '../core/resvg';