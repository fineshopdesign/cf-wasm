import { initResvg } from '../core/resvg';
import MODULE from '../core/resvg.wasm?module';

initResvg(MODULE);

export { MODULE };
export {
  Resvg,
  type ResvgRenderOptions,
  type CustomFontsOptions,
  type FontOptions,
  type SystemFontsOptions,
} from '../core/resvg';
