import fs from 'fs-extra';

const RESVG_WASM_LOCATION = new URL(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm')).pathname;
const RESVG_WASM_DESTINATION = 'src/core/resvg.wasm';

const RESVG_WASM_LOCATION_2_4_1 = new URL(import.meta.resolve('@resvg/resvg-wasm-2.4.1/index_bg.wasm')).pathname;
const RESVG_WASM_DESTINATION_2_4_1 = 'src/2.4.1/core/resvg.wasm';

// Copy yoga wasm file
fs.copySync(RESVG_WASM_LOCATION, RESVG_WASM_DESTINATION);

// Copy yoga wasm file
fs.copySync(RESVG_WASM_LOCATION_2_4_1, RESVG_WASM_DESTINATION_2_4_1);
