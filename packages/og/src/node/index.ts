import path from "node:path";
import fs from "node:fs";
import url from "node:url";
import * as resvg from "@cf-wasm/resvg/node";
import * as satori from "@cf-wasm/satori/node";

import { defaultFont, modules } from "../lib";

const filename =
	typeof __filename === "string"
		? __filename
		: url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const fallbackFont = fs.readFileSync(
	path.resolve(dirname, "../lib/noto-sans-v27-latin-regular.ttf.bin")
);

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
	cache,
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
