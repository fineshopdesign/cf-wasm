import yogaWasmModule from './lib/yoga.wasm?module';
import { initSatori, satori } from './satori';

initSatori(yogaWasmModule);

export default satori;
export * from './satori';
export { yogaWasmModule };
