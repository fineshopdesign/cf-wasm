import initAsync, { initSync } from "../png";
import MODULE from "../lib/png_bg.wasm?module";

initSync(MODULE);

export { initAsync, MODULE };
export * from "../png";
