import { modules } from "./modules";
import { loadDynamicAsset } from "./asset";
import { type EmojiType } from "./emoji";
import type { ResvgRenderOptions } from "./resvg";
import type { SatoriOptions, Font } from "./satori";
import { CustomFont, GoogleFont } from "./font";

export type PngResult = {
	pixels: Uint8Array;
	image: Uint8Array;
	width: number;
	height: number;
};

export type SvgResult = {
	image: string;
	width: number;
	height: number;
};

export type RenderSatoriOptions = Omit<
	SatoriOptions,
	"width" | "height" | "fonts" | "loadAdditionalAsset" | "debug"
>;

export type RenderResvgOptions = Omit<ResvgRenderOptions, "font">;

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

	format?: "svg" | "png";

	satoriOptions?: RenderSatoriOptions;

	resvgOptions?: RenderResvgOptions;
};

function render(element: React.ReactElement, options?: RenderOptions) {
	const data: {
		svg: SvgResult | undefined;
		png: PngResult | undefined;
	} = {
		svg: undefined,
		png: undefined
	};

	const renderOptions = {
		width: 1200,
		height: 630,
		debug: false,
		fonts: [],
		...options
	};

	const asSvg = async () => {
		if (!data.svg) {
			const fallbackFont = await modules.getFallbackFont();
			if (!fallbackFont) {
				console.warn(
					"(@cf-wasm/og) [ WARNING ] No default font was provided, fetching 'Noto Sans' from Google fonts and setting as default font"
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
			const satoriOptions = {
				...renderOptions.satoriOptions,
				width: renderOptions.width,
				height: renderOptions.height,
				debug: renderOptions.debug,
				fonts: satoriFonts,
				loadAdditionalAsset: loadDynamicAsset({
					emoji: renderOptions?.emoji
				}) as SatoriOptions["loadAdditionalAsset"]
			};
			const svg = await modules.satori.satori(element, satoriOptions);

			data.svg = {
				image: svg,
				height: satoriOptions.height,
				width: satoriOptions.width
			};
		}

		return data.svg;
	};

	const asPng = async () => {
		if (!data.png) {
			const svg = await asSvg();
			const resvg = await modules.resvg.Resvg.create(svg.image, {
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
	// const svg = await satori(element, {
	// 	width: options.width,
	// 	height: options.height,
	// 	debug: options.debug,
	// 	fonts: options.fonts || defaultFonts,
	// 	loadAdditionalAsset: loadDynamicAsset({
	// 		emoji: options.emoji
	// 	})
	// });
}

export { render };
