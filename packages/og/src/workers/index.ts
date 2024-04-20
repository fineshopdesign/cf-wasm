import * as resvg from "@cf-wasm/resvg/workers";
import * as satori from "@cf-wasm/satori/workers";
import fallbackFont from "../lib/noto-sans-v27-latin-regular.ttf.bin";
import { defaultFont, modules } from "../lib";

// Set modules
modules.resvg = resvg;
modules.satori = satori;

// Set default font
defaultFont.set(fallbackFont);

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
