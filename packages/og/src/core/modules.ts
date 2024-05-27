import type { ResvgModule } from './resvg';
import type { SatoriModule } from './satori';

/** Modules */
class Modules {
  private _resvg?: ResvgModule;
  private _satori?: SatoriModule;

  /** The {@link ResvgModule} */
  get resvg() {
    if (!this._resvg) {
      throw new Error('Module `resvg` is not set, set it before accessing.');
    }
    return this._resvg;
  }
  set resvg(module) {
    this._resvg = module;
  }

  /** The {@link SatoriModule} */
  get satori() {
    if (!this._satori) {
      throw new Error('Module `satori` is not set, set it before accessing.');
    }
    return this._satori;
  }
  set satori(module) {
    this._satori = module;
  }

  /** Sets modules */
  set(resvgModule: ResvgModule, satoriModule: SatoriModule) {
    this.resvg = resvgModule;
    this.satori = satoriModule;
  }

  /** Ensures all the modules are set */
  isUsable() {
    if (this._resvg && this._satori) {
      return true;
    }
    return false;
  }
}

export const modules = new Modules();
