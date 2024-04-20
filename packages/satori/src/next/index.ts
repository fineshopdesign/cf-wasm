import initYoga from "yoga-wasm-web";
import { init, satori } from "../lib/satori";
import YOGA_MODULE from "../lib/yoga.wasm?module";

init(initYoga(YOGA_MODULE));

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
