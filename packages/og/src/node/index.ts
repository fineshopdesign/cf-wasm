import path from "path";
import fs from "fs";
import * as resvg from "@cf-wasm/resvg/node";
// eslint-disable-next-line import/namespace
import * as satori from "@cf-wasm/satori/node";
import { modules } from "../lib";

const fallbackFont = fs.readFileSync(
	path.resolve(__dirname, "../lib/noto-sans-v27-latin-regular.ttf.bin")
);

modules.resvg = resvg;
modules.satori = satori;
modules.setFallbackFont(fallbackFont);

export {
	setDefaultFont,
	render,
	loadGoogleFont,
	ImageResponse,
	FigmaImageResponse,
	CustomFont,
	GoogleFont,
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
