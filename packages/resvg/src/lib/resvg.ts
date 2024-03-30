import {
	Resvg as ResvgClass,
	initWasm,
	type InitInput,
	type ResvgRenderOptions
} from "@resvg/resvg-wasm";

export const init = (input: InitInput | Promise<InitInput>) => {
	if (init.called) {
		throw new Error("init() can be called only once");
	}
	init.called = true;
	init.input = input;
};
init.called = false;
init.input = undefined as InitInput | Promise<InitInput> | undefined;

export const ensureInit = async () => {
	if (!init.called) {
		throw new Error("Call init() first");
	}
	if (!init.input) {
		throw new Error("Input provided using init() is not valid");
	}
	if (!ensureInit.initialized) {
		await initWasm(init.input);
		ensureInit.initialized = true;
	}
};
ensureInit.initialized = false;

export class Resvg extends ResvgClass {
	public static async create(
		svg: string | Uint8Array,
		options?: ResvgRenderOptions
	) {
		await ensureInit();
		return new Resvg(svg, options);
	}
}

export {
	type InitInput,
	type ResvgRenderOptions,
	type CustomFontsOptions,
	type FontOptions,
	type SystemFontsOptions
} from "@resvg/resvg-wasm";
