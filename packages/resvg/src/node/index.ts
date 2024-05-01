import path from "node:path";
import fs from "node:fs";
import url from "node:url";

import { init } from "../lib/resvg";

const filename =
	typeof __filename === "string"
		? __filename
		: url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const wasmBinaries = fs.readFileSync(
	path.resolve(dirname, "../lib/resvg.wasm")
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
