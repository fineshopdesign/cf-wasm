import {
	initWasm as initAsync,
	Resvg as ResvgClass,
	type InitInput,
	type ResvgRenderOptions
} from "@resvg/resvg-wasm";

export const initResvg = async (input: InitInput | Promise<InitInput>) => {
	if (initResvg.initialized) {
		throw new Error(
			"Already initialized. The `initResvg()` function can be used only once."
		);
	}
	await initAsync(input);
};
initResvg.initialized = false;

export class Resvg extends ResvgClass {
	public static create(svg: string | Uint8Array, options?: ResvgRenderOptions) {
		return Promise.resolve(new Resvg(svg, options));
	}
}

export {
	type InitInput,
	type ResvgRenderOptions,
	type CustomFontsOptions,
	type FontOptions,
	type SystemFontsOptions
} from "@resvg/resvg-wasm";
