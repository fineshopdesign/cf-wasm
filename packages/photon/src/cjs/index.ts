import path from "path";
import fs from "fs";
import initAsync, { initSync } from "../lib/photon";

const wasmBinaries = fs.readFileSync(
	path.resolve(__dirname, "../lib/photon_bg.wasm")
);

const MODULE = new WebAssembly.Module(wasmBinaries);

initSync(MODULE);

export { initAsync, MODULE };
export * from "../lib/photon";
