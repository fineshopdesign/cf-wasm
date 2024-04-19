import * as resvg from "@cf-wasm/resvg/next";
import * as satori from "@cf-wasm/satori/next";
import { modules } from "../lib";

modules.resvg = resvg;
modules.satori = satori;
modules.setDefaultFont(() =>
	fetch(
		new URL("../lib/noto-sans-v27-latin-regular.ttf.bin", import.meta.url)
	).then((res) => res.arrayBuffer())
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
