import initAsync, { initSync } from "../lib/photon_rs";
import MODULE from "../lib/photon_rs_bg.wasm";

initSync(MODULE);

export { initAsync, MODULE };
export * from "../lib/photon_rs";
