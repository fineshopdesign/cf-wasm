import { init } from "../lib/resvg";
import MODULE from "../lib/resvg.wasm";

init(MODULE);

export { MODULE };
export {
	Resvg,
	ensureInit,
	type ResvgRenderOptions,
	type CustomFontsOptions,
	type FontOptions,
	type InitInput,
	type SystemFontsOptions
} from "../lib/resvg";
