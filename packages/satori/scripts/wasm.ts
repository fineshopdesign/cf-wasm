import fs from 'fs-extra';

const YOGA_WASM_LOCATION = new URL(import.meta.resolve('yoga-wasm-web/dist/yoga.wasm')).pathname;
const YOGA_WASM_DESTINATION = 'src/core/yoga.wasm';

// Copy yoga wasm file
fs.copySync(YOGA_WASM_LOCATION, YOGA_WASM_DESTINATION);
