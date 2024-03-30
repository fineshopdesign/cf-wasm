import * as resvg from "@cf-wasm/resvg/next";
import * as satori from "@cf-wasm/satori/next";
import { modules } from "../lib";

modules.resvg = resvg;
modules.satori = satori;

/**
 * Don't import using fetch if runtime is expected to be workerd
 * This is because when I wrote this, next-on-pages doesn't support it
 * Since no fallback font will be set, it will fetch from Google Fonts
 * Fallback font can be set before using API using setDefaultFont()
 */
const isWorkerdRuntime =
	typeof navigator === "object" &&
	navigator &&
	navigator.userAgent === "Cloudflare-Workers";
if (!isWorkerdRuntime) {
	modules.setFallbackFont(() =>
		fetch(
			new URL("../lib/noto-sans-v27-latin-regular.ttf.bin", import.meta.url)
		).then((res) => res.arrayBuffer())
	);
}

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
