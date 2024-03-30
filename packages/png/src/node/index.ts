import path from "path";
import fs from "fs";
import initAsync, { initSync } from "../png";

const wasmBinaries = fs.readFileSync(
	path.resolve(__dirname, "../lib/png_bg.wasm")
);

const MODULE = new WebAssembly.Module(wasmBinaries);

initSync(MODULE);

export { initAsync, MODULE };
export * from "../png";
