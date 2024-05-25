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
  /**
   * The {@link ResvgModule}
   */
  get resvg() {
    if (!MODULE_DATA.resvg) {
      throw new Error('modules.resvg is not set!');
    }
    return MODULE_DATA.resvg;
  },
  set resvg(m) {
    MODULE_DATA.resvg = m;
  },

  /**
   * The {@link SatoriModule}
   */
  get satori() {
    if (!MODULE_DATA.satori) {
      throw new Error('modules.satori is not set!');
    }
    return MODULE_DATA.satori;
  },
  set satori(m) {
    MODULE_DATA.satori = m;
  },
};
