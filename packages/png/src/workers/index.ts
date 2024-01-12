import { initSync } from "../png";
import MODULE from "../../lib/png_bg.wasm";

initSync(MODULE);

export { default } from "../png";
export { MODULE };
export * from "../png";
