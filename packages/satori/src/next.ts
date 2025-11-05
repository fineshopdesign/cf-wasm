import { initSatori, satori } from './core/satori';
import { initYoga } from './core/yoga';
import yogaWasmModule from './core/yoga.wasm?module';

initSatori(initYoga(yogaWasmModule));

export default satori;
export { yogaWasmModule };
export {
  type Font,
  type FontStyle,
  type FontWeight,
  type Locale,
  type SatoriNode,
  type SatoriOptions,
  satori,
  type VNode,
} from './core/satori';
export { initYoga, type Yoga } from './core/yoga';
