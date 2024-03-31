import type { ResvgModule } from "./resvg";
import type { SatoriModule } from "./satori";

export type FallbackFont =
	| ArrayBuffer
	| Response
	| Promise<ArrayBuffer | Response>
	| { data: ArrayBuffer | Promise<ArrayBuffer> };

const data: {
	resvg: ResvgModule | undefined;
	satori: SatoriModule | undefined;
	fallbackFont: FallbackFont | (() => FallbackFont) | undefined;
	fontData: ArrayBuffer | undefined;
	fontShouldResolve: boolean;
} = {
	resvg: undefined,
	satori: undefined,
	fallbackFont: undefined,
	fontData: undefined,
	fontShouldResolve: true
};

export const setDefaultFont = (input: FallbackFont | (() => FallbackFont)) => {
	if (!input) {
		throw new Error("Argument 1 type is not acceptable");
	}
	data.fontShouldResolve = true;
	data.fallbackFont = input;
};

export const getDefaultFont = async () => {
	const { fallbackFont, fontData, fontShouldResolve } = data;

	let buffer: ArrayBuffer | undefined;
	const fontInput =
		typeof fallbackFont === "function" ? fallbackFont() : fallbackFont;

	if (fontShouldResolve && fontInput) {
		if (fontInput instanceof Promise) {
			const result = await fontInput;
			if (result instanceof Response) {
				buffer = await result.arrayBuffer();
			} else {
				buffer = result;
			}
		} else if (fontInput instanceof Response) {
			buffer = await fontInput.arrayBuffer();
		} else if ("data" in fontInput) {
			buffer = await fontInput.data;
		} else {
			buffer = fontInput;
		}
	} else if (fontData) {
		buffer = fontData;
	}
	data.fontData = buffer;
	data.fontShouldResolve = false;
	return buffer;
};

export const hasDefaultFont = () => Boolean(data.fallbackFont);

export const modules = {
	get resvg() {
		if (!data.resvg) {
			throw new Error("modules.resvg is not set!");
		}
		return data.resvg;
	},
	set resvg(m) {
		data.resvg = m;
	},
	get satori() {
		if (!data.satori) {
			throw new Error("modules.satori is not set!");
		}
		return data.satori;
	},
	set satori(m) {
		data.satori = m;
	},
	setDefaultFont,
	getDefaultFont,
	hasDefaultFont
};
