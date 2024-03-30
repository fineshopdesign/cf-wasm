import path from "path";
import fs from "fs";
import { init } from "../lib/resvg";

const wasmBinaries = fs.readFileSync(
	path.resolve(__dirname, "../lib/resvg.wasm")
);

const MODULE = new WebAssembly.Module(wasmBinaries);

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
