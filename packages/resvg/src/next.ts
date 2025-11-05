import { initResvg } from './core/resvg';
import resvgWasmModule from './core/resvg.wasm?module';

initResvg(resvgWasmModule);

export { resvgWasmModule };
export {
  type CustomFontsOptions,
  type FontOptions,
  Resvg,
  type ResvgRenderOptions,
  type SystemFontsOptions,
} from './core/resvg';
