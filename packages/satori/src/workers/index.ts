import initYoga from 'yoga-wasm-web';
import { initSatori, satori } from '../core/satori';
import yogaWasmModule from '../core/yoga.wasm';

initSatori(initYoga(yogaWasmModule));

export default satori;
export { yogaWasmModule };
export {
  satori,
  type Font,
  type FontStyle,
  type FontWeight,
  type Locale,
  type SatoriNode,
  type SatoriOptions,
  type VNode,
} from '../core/satori';
