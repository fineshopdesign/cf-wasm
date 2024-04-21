import { modules, defaultFont } from "./modules";
import { type EmojiType } from "./emoji";
import { CustomFont, GoogleFont } from "./font";
import { loadDynamicAsset } from "./asset";
import type { CustomFontsOptions, ResvgRenderOptions } from "./resvg";
import type { SatoriOptions, Font } from "./satori";
import { parseHTML } from "./html";

export interface PngResult {
	pixels: Uint8Array;
	image: Uint8Array;
	width: number;
	height: number;
}

export interface SvgResult {
	image: string;
	width: number;
	height: number;
}

export type RenderSatoriOptions = Omit<
	SatoriOptions,
	"width" | "height" | "fonts" | "loadAdditionalAsset" | "debug"
>;

export type RenderResvgOptions = Omit<ResvgRenderOptions, "fitTo" | "font"> & {
	font?: CustomFontsOptions;
};

export type RenderOptions = {
	/**
	 * The width of the image.
	 *
	 * @default 1200
	 */
	width?: number;

	/**
	 * The height of the image.
	 *
	 * @default 630
	 */
	height?: number;

	/**
	 * Display debug information on the image.
	 *
	 * @default false
	 */
	debug?: boolean;

	/**
	 * A list of fonts to use.
	 *
	 * @default Noto Sans Latin Regular.
	 */
	fonts?: (Omit<Font, "data"> & { data: ArrayBuffer | Promise<ArrayBuffer> })[];

	/**
	 * Using a specific Emoji style. Defaults to `twemoji`.
	 *
	 * @default 'twemoji'
	 */
	emoji?: EmojiType;

	/**
	 * The format of response, can be one of `svg` or `png`
	 */
	format?: "svg" | "png";

	/**
	 * Passes {@link RenderSatoriOptions} to satori
	 */
	satoriOptions?: RenderSatoriOptions;

	/**
	 * Passes {@link RenderResvgOptions} to resvg
	 */
	resvgOptions?: RenderResvgOptions;
};

/**
 * Renders {@link React.ReactElement} or html string to image
 *
 * @param element The {@link React.ReactElement} or html string
 * @param options The {@link RenderOptions}
 *
 * @returns An object containing methods for rendering the input element to image
 */
export const render = (
	element: string | React.ReactElement,
	options?: RenderOptions
) => {
	const data: {
		svg: SvgResult | undefined;
		png: PngResult | undefined;
		fonts: SatoriOptions["fonts"] | undefined;
	} = {
		svg: undefined,
		png: undefined,
		fonts: undefined
	};

	const renderOptions = {
		width: 1200,
		height: 630,
		debug: false,
		fonts: [],
		...options
	};

	const getFonts = async () => {
		if (!data.fonts) {
			const fallbackFont = await defaultFont.get();
			if (!fallbackFont) {
				console.warn(
					"(@cf-wasm/og) [ WARN ] No default font was provided, fetching 'Noto Sans' from Google fonts and setting as default font"
				);
			}
			const defaultFonts = [
				fallbackFont
					? new CustomFont("sans serif", fallbackFont, {
							weight: 400,
							style: "normal"
						})
					: new GoogleFont("Noto Sans", {
							name: "sans serif",
							weight: 400,
							style: "normal"
						})
			];
			const satoriFonts: SatoriOptions["fonts"] = await Promise.all(
				[...defaultFonts, ...renderOptions.fonts].map(async (font) => ({
					...font,
					data: await font.data
				}))
			);

			data.fonts = satoriFonts;
		}

		return data.fonts;
	};

	/**
	 * Method to render the element as svg image
	 *
	 * @returns A promise which resolves to rendered svg image as {@link SvgResult}
	 */
	const asSvg = async () => {
		if (!data.svg) {
			const satoriFonts = await getFonts();

			const satoriOptions = {
				...renderOptions.satoriOptions,
				width: renderOptions.width,
				height: renderOptions.height,
				debug: renderOptions.debug,
				fonts: satoriFonts,
				loadAdditionalAsset: loadDynamicAsset({
					emoji: renderOptions?.emoji
				})
			};
			const svg = await modules.satori.satori(
				typeof element === "string" ? parseHTML(element) : element,
				satoriOptions
			);

			data.svg = {
				image: svg,
				height: satoriOptions.height,
				width: satoriOptions.width
			};
		}

		return data.svg;
	};

	/**
	 * Method to render the element as png image
	 *
	 * @returns A promise which resolves to rendered png image as {@link PngResult}
	 */
	const asPng = async () => {
		if (!data.png) {
			const svg = await asSvg();
			const fonts = await getFonts();
			const resvg = await modules.resvg.Resvg.create(svg.image, {
				// Pass only the first font which is also the default font
				font: fonts[0]
					? {
							fontBuffers: [new Uint8Array(fonts[0].data)]
						}
					: undefined,
				...renderOptions.resvgOptions,
				fitTo: {
					mode: "width",
					value: renderOptions.width
				}
			});
			const renderedImage = resvg.render();

			data.png = {
				pixels: renderedImage.pixels,
				image: renderedImage.asPng(),
				width: renderedImage.width,
				height: renderedImage.height
			};

			resvg.free();
			renderedImage.free();
		}

		return data.png;
	};

	return { asSvg, asPng };
};
