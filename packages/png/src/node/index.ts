import path from "node:path";
import fs from "node:fs";
import url from "node:url";

import initAsync, { initSync } from "../png";

const filename =
	typeof __filename === "string"
		? __filename
		: url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const wasmBinaries = fs.readFileSync(
	path.resolve(dirname, "../lib/png_bg.wasm")
);

const MODULE = new WebAssembly.Module(wasmBinaries);

initSync(MODULE);

export { initAsync, MODULE };
export * from "../png";
