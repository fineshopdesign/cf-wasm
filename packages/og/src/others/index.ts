import * as resvg from "@cf-wasm/resvg/others";
import * as satori from "@cf-wasm/satori/others";
import { GoogleFont, modules } from "../lib";

modules.resvg = resvg;
modules.satori = satori;
modules.setDefaultFont(
	new GoogleFont("Noto Sans", {
		name: "sans serif",
		weight: 400,
		style: "normal"
	})
);

export {
	ImageResponse,
	FigmaImageResponse,
	CustomFont,
	GoogleFont,
	render,
	setDefaultFont,
	loadGoogleFont,
	getCache,
	type ImageResponseOptions,
	type FigmaComplexTemplate,
	type CustomFontOptions,
	type GoogleFontOptions,
	type EmojiType,
	type RenderOptions,
	type SvgResult,
	type PngResult,
	type Font,
	type FontStyle,
	type FontWeight,
	type RenderResvgOptions,
	type RenderSatoriOptions,
	type ResvgRenderOptions,
	type SatoriNode,
	type SatoriOptions
} from "../lib";

export { initResvg } from "@cf-wasm/resvg/others";
export { initSatori } from "@cf-wasm/satori/others";
