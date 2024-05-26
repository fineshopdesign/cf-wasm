import type { ResvgModule } from './resvg';
import type { SatoriModule } from './satori';

const MODULE_DATA: {
  resvg: ResvgModule | null;
  satori: SatoriModule | null;
} = {
  resvg: null,
  satori: null,
};

export const modules = {
  /** The {@link ResvgModule} */
  get resvg() {
    if (!MODULE_DATA.resvg) {
      throw new Error('Module `resvg` is not set, set it before accessing.');
    }
    return MODULE_DATA.resvg;
  },
  set resvg(module) {
    MODULE_DATA.resvg = module;
  },

  /** The {@link SatoriModule} */
  get satori() {
    if (!MODULE_DATA.satori) {
      throw new Error('Module `satori` is not set, set it before accessing.');
    }
    return MODULE_DATA.satori;
  },
  set satori(module) {
    MODULE_DATA.satori = module;
  },

  /** Sets modules */
  set(resvgModule: ResvgModule, satoriModule: SatoriModule) {
    this.resvg = resvgModule;
    this.satori = satoriModule;
  },

  /** Ensures all the modules are set */
  isUsable() {
    if (MODULE_DATA.resvg && MODULE_DATA.satori) {
      return true;
    }
    return false;
  },
};
