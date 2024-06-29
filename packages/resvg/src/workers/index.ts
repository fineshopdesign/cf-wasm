import { initResvg } from '../core/resvg';
import resvgWasmModule from '../core/resvg.wasm';

initResvg(resvgWasmModule);

export { resvgWasmModule };
export {
  Resvg,
  type ResvgRenderOptions,
  type CustomFontsOptions,
  type FontOptions,
  type SystemFontsOptions,
} from '../core/resvg';
