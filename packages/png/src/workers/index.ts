import MODULE from '../lib/png_bg.wasm';
import initAsync, { initSync } from '../png';

initSync(MODULE);

export { initAsync, MODULE };
export * from '../png';
