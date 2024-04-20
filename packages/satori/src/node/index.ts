import path from "path";
import fs from "fs";
import { init, satori } from "../lib/satori";

const wasmBinaries = fs.readFileSync(
	path.resolve(__dirname, "../lib/yoga.wasm")
);

const YOGA_MODULE = new WebAssembly.Module(wasmBinaries);

init(import("yoga-wasm-web").then((m) => m.default(YOGA_MODULE)));

export default satori;
export { YOGA_MODULE };
export {
	satori,
	ensureInit,
	type Font,
	type FontStyle,
	type FontWeight,
	type Locale,
	type SatoriNode,
	type SatoriOptions
} from "../lib/satori";
