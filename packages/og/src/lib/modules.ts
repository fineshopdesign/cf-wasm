import type { ResvgModule } from "./resvg";
import type { SatoriModule } from "./satori";

const data: {
	resvg: ResvgModule | null;
	satori: SatoriModule | null;
} = {
	resvg: null,
	satori: null
};

// eslint-disable-next-line import/prefer-default-export
export const modules = {
	/**
	 * The {@link ResvgModule}
	 */
	get resvg() {
		if (!data.resvg) {
			throw new Error("modules.resvg is not set!");
		}
		return data.resvg;
	},
	set resvg(m) {
		data.resvg = m;
	},

	/**
	 * The {@link SatoriModule}
	 */
	get satori() {
		if (!data.satori) {
			throw new Error("modules.satori is not set!");
		}
		return data.satori;
	},
	set satori(m) {
		data.satori = m;
	}
};
