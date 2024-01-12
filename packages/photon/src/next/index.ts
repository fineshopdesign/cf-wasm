import { initSync } from "../../lib/photon";
import MODULE from "../../lib/photon_bg.wasm?module";

initSync(MODULE);

export { default } from "../../lib/photon";
export { MODULE };
export * from "../../lib/photon";
