import yogaWasmBuffer from './lib/yoga.wasm.inline';
import { initSatori, satori } from './satori';

const yogaWasmModule = new WebAssembly.Module(yogaWasmBuffer);

initSatori(import('./yoga').then((module) => module.initYoga(yogaWasmModule)));

export default satori;
export { yogaWasmModule };
export * from './satori';
export { initYoga, type Yoga } from './yoga';
