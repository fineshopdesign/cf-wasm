import yogaWasmBuffer from './lib/yoga.wasm.inline';
import { initSatori, satori } from './satori';

const yogaWasmModule = new WebAssembly.Module(yogaWasmBuffer);

initSatori(yogaWasmModule);

export default satori;
export { yogaWasmModule };
export * from './satori';
