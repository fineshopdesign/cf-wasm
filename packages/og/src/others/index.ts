import * as resvg from "@cf-wasm/resvg/others";
import * as satori from "@cf-wasm/satori/others";
import { GoogleFont, defaultFont, modules } from "../lib";

// Set modules
modules.resvg = resvg;
modules.satori = satori;

// Set default font
defaultFont.set(
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
	defaultFont,
	loadGoogleFont,
	getCache,
	parseHTML,
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
	type SatoriOptions,
	type ParserOptions
} from "../lib";

export { initResvg } from "@cf-wasm/resvg/others";
export { initSatori } from "@cf-wasm/satori/others";
