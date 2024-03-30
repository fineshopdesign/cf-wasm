import path from "path";
import fs from "fs";
import initAsync, { initSync } from "../lib/photon_rs";

const wasmBinaries = fs.readFileSync(
	path.resolve(__dirname, "../lib/photon_rs_bg.wasm")
);

const MODULE = new WebAssembly.Module(wasmBinaries);

initSync(MODULE);

export { initAsync, MODULE };
export * from "../lib/photon_rs";
