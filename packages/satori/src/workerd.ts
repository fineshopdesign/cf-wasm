import yogaWasmModule from './lib/yoga.wasm';
import { initSatori, satori } from './satori';

initSatori(yogaWasmModule);

export default satori;
export { yogaWasmModule };
export * from './satori';
