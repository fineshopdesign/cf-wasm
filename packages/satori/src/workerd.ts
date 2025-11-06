import yogaWasmModule from './lib/yoga.wasm';
import { initSatori, satori } from './satori';
import { initYoga } from './yoga';

initSatori(initYoga(yogaWasmModule));

export default satori;
export { yogaWasmModule };
export * from './satori';
export { initYoga, type Yoga } from './yoga';
