import initYoga from 'yoga-wasm-web';
import { initSatori, satori } from '../core/satori';
import YOGA_MODULE from '../core/yoga.wasm?module';

initSatori(initYoga(YOGA_MODULE));

export default satori;
export { YOGA_MODULE };
export {
  satori,
  type Font,
  type FontStyle,
  type FontWeight,
  type Locale,
  type SatoriNode,
  type SatoriOptions,
} from '../core/satori';
