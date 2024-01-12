import { initSync } from "../png";
import MODULE from "../../lib/png_bg.wasm?module";

initSync(MODULE);

export { default } from "../png";
export { MODULE };
export * from "../png";
