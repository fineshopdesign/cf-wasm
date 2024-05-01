import path from "node:path";
import url from "node:url";
import fs from "node:fs";

import initAsync, { initSync } from "../lib/photon_rs";

const filename =
	typeof __filename === "string"
		? __filename
		: url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const wasmBinaries = fs.readFileSync(
	path.resolve(dirname, "../lib/photon_rs_bg.wasm")
);

const MODULE = new WebAssembly.Module(wasmBinaries);

initSync(MODULE);

export { initAsync, MODULE };
export * from "../lib/photon_rs";
