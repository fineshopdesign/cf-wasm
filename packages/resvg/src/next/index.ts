import { init } from '../core/resvg';
import MODULE from '../core/resvg.wasm?module';

init(MODULE);

export { MODULE };
export {
  Resvg,
  type ResvgRenderOptions,
  type CustomFontsOptions,
  type FontOptions,
  type SystemFontsOptions,
} from '../core/resvg';
