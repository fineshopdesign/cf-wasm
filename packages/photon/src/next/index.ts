import initAsync, { initSync } from "../lib/photon";
import MODULE from "../lib/photon_bg.wasm?module";

initSync(MODULE);

export { initAsync, MODULE };
export * from "../lib/photon";
