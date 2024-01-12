import path from "path";
import fs from "fs";
import { initSync } from "../../lib/photon";

const wasmBinaries = fs.readFileSync(
	path.resolve(__dirname, "../../lib/photon")
);

const MODULE = new WebAssembly.Module(wasmBinaries);

initSync(MODULE);

export { default } from "../../lib/photon";
export { MODULE };
export * from "../../lib/photon";
