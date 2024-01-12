import path from "path";
import fs from "fs";
import { initSync } from "../png";

const wasmBinaries = fs.readFileSync(
	path.resolve(__dirname, "../../lib/photon")
);

const MODULE = new WebAssembly.Module(wasmBinaries);

initSync(MODULE);

export { default } from "../png";
export { MODULE };
export * from "../png";
