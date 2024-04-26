/* eslint-disable max-classes-per-file */
import { cache } from "./cache";
import { FetchError } from "./errors";
import type { FontStyle, FontWeight } from "./satori";
import type { MayBePromise } from "./types";

export const fontCacheMap = new Map<string, ArrayBuffer>();

/**
 * An interface representing options for {@link loadGoogleFont} function
 */
export interface LoadGoogleFontOptions {
	text?: string;

	/**
	 * The font weight to load
	 */
	weight?: string | number;

	/**
	 * Indicates whether italic style should be loaded
	 */
	italic?: boolean;

	/**
	 * Indicates whether normal style should be loaded
	 */
	normal?: boolean;

	/**
	 * The `font-display`
	 */
	display?: "auto" | "block" | "swap" | "fallback" | "optional";

	cache?: Cache;
}

/**
 * A helper function for loading google fonts as {@link ArrayBuffer}
 *
 * @param family The name of the font family
 * @param param1 Options
 *
 * @returns A promise which resolved to {@link ArrayBuffer}
 */
export const loadGoogleFont = async (
	family: string,
	{
		text,
		weight,
		italic = false,
		normal = true,
		display,
		cache: cacheStore
	}: LoadGoogleFontOptions = {}
) => {
	if (typeof family !== "string" || family.trim().length === 0) {
		throw new Error(
			`Failed to download dynamic font. Not a valid font family name was provided`
		);
	}

	let familyDelimiter = "";
	if (weight || italic) {
		familyDelimiter += ":";
		if (italic) {
			familyDelimiter += "ital";
			if (weight) {
				familyDelimiter += `,wght@1,${weight}`;
			}
		}
		if (normal && weight) {
			familyDelimiter += `wght@`;
			if (italic) {
				familyDelimiter += `0,`;
			}
			familyDelimiter += weight;
		}
	}

	const params: Record<string, string> = {
		family: encodeURIComponent(family) + familyDelimiter
	};

	if (text) {
		params.text = encodeURIComponent(text);
	} else {
		params.subset = "latin";
	}

	if (typeof display === "string") {
		params.display = display;
	}

	const cssUrl = `https://fonts.googleapis.com/css2?${Object.keys(params)
		.map((key) => `${key}=${params[key]}`)
		.join("&")}`;

	const fromMap = fontCacheMap.get(cssUrl);

	if (fromMap) {
		return fromMap;
	}

	const cssResponse = await cache.serve(
		cssUrl,
		() =>
			fetch(cssUrl, {
				headers: {
					"User-Agent":
						"Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"
				}
			})
				.then((res) => {
					if (res.status === 400) {
						throw new FetchError(
							`Google Font is not available (status: ${res.status}, statusText: ${res.statusText})`,
							{ response: res }
						);
					}
					if (!res.ok) {
						throw new FetchError(
							`Response was not successful (status: ${res.status}, statusText: ${res.statusText})`,
							{ response: res }
						);
					}
					return res;
				})
				.catch((e) => {
					throw new FetchError(
						`Failed to download dynamic font. An error ocurred while fetching ${cssUrl}`,
						{
							cause: e,
							response: e instanceof FetchError ? e.response : undefined
						}
					);
				}),
		{ cache: cacheStore }
	);

	const css = await cssResponse.text();
	const fontUrl = css.match(
		/src: url\((.+)\) format\('(opentype|truetype)'\)/
	)?.[1];

	if (!fontUrl) {
		throw new Error(`Failed to download dynamic font. No font was found.`);
	}

	const fontResponse = await cache.serve(
		fontUrl,
		() =>
			fetch(fontUrl)
				.then((res) => {
					if (!res.ok) {
						throw new FetchError(
							`Response was not successful (status: ${res.status}, statusText: ${res.statusText})`,
							{ response: res }
						);
					}
					return res;
				})
				.catch((e) => {
					throw new FetchError(
						`Failed to download dynamic font. An error ocurred while fetching ${fontUrl}`,
						{
							cause: e,
							response: e instanceof FetchError ? e.response : undefined
						}
					);
				}),
		{ cache: cacheStore }
	);

	const buffer = await fontResponse.arrayBuffer();

	fontCacheMap.set(cssUrl, buffer);

	return buffer;
};

export interface BaseFontOptions {
	weight?: FontWeight;
	style?: FontStyle;
}

export class BaseFont {
	protected input;

	name: string;

	style: FontStyle;

	weight: FontWeight;

	constructor(
		name: string,
		input:
			| ArrayBuffer
			| Promise<ArrayBuffer>
			| (() => ArrayBuffer | Promise<ArrayBuffer>)
			| undefined,
		{ weight = 400, style = "normal" }: BaseFontOptions = {}
	) {
		this.input = input;
		this.name = name;
		this.style = style;
		this.weight = weight;
	}

	get data() {
		return this.input;
	}
}

export interface CustomFontOptions extends BaseFontOptions {
	lang?: string;
}

/**
 * A helper class to load Custom Fonts
 */
export class CustomFont extends BaseFont {
	protected input:
		| ArrayBuffer
		| Promise<ArrayBuffer>
		| (() => ArrayBuffer | Promise<ArrayBuffer>);

	private evaluated: ArrayBuffer | undefined;

	lang: string | undefined;

	/**
	 * Creates an instance of {@link CustomFont}
	 *
	 * @param name The name of the font (can be used for font-family css property)
	 * @param input Font data as `ArrayBuffer` or a promise which resolves to `ArrayBuffer`
	 * @param options
	 */
	constructor(
		name: string,
		input: ArrayBuffer | Promise<ArrayBuffer> | (() => Promise<ArrayBuffer>),
		options?: CustomFontOptions
	) {
		super(name, input, options);
		this.input = input;
		this.lang = options?.lang;
	}

	/**
	 * A promise which resolves to font data as `ArrayBuffer`
	 */
	get data(): Promise<ArrayBuffer> {
		return (async () => {
			if (!this.evaluated) {
				this.evaluated = await (typeof this.input === "function"
					? this.input()
					: this.input);
			}
			return this.evaluated;
		})();
	}
}

export interface GoogleFontOptions extends BaseFontOptions {
	/**
	 * The name of the font (can be used for font-family css property)
	 */
	name?: string;

	/**
	 * Loads font only for particular text (for better performance)
	 */
	text?: string;
}

/**
 * A helper class to load Google Fonts
 */
export class GoogleFont extends BaseFont {
	protected input: Promise<ArrayBuffer> | undefined;

	private evaluated: ArrayBuffer | undefined;

	/**
	 * The font family name
	 */
	family: string;

	/**
	 * Text for which the font is loaded
	 */
	text: string | undefined;

	/**
	 * Creates an instance of {@link GoogleFont}
	 *
	 * @param family The name of font family to load
	 * @param options The {@link GoogleFontOptions}
	 */
	constructor(family: string, options: GoogleFontOptions = {}) {
		super(options.name || family, undefined, options);
		this.family = family;
		this.text = options.text;
		this.input = undefined;
	}

	/**
	 * A promise which resolves to font data as `ArrayBuffer`
	 */
	get data(): Promise<ArrayBuffer> {
		return (async () => {
			if (!this.evaluated) {
				this.evaluated = await loadGoogleFont(this.family, {
					weight: this.weight,
					italic: this.style === "italic",
					normal: this.style === "normal",
					text: this.text
				});
			}
			return this.evaluated;
		})();
	}

	async isAvailable() {
		try {
			await this.data;
		} catch (e) {
			if (e instanceof FetchError && e.response?.status === 400) {
				return false;
			}
		}
		return true;
	}
}

export type FontInput =
	| MayBePromise<ArrayBuffer | Response>
	| { data: ArrayBuffer | Promise<ArrayBuffer> };

const data: {
	fallbackFont: FontInput | (() => FontInput) | undefined;
	fontData: ArrayBuffer | undefined;
	fontShouldResolve: boolean;
} = {
	fallbackFont: undefined,
	fontData: undefined,
	fontShouldResolve: true
};

export const defaultFont = {
	/**
	 * Sets default font for image rendering
	 *
	 * @param input {@link FontInput}
	 */
	set: (input: FontInput | (() => FontInput)) => {
		if (!input) {
			throw new TypeError("Argument 1 type is not acceptable");
		}
		data.fontShouldResolve = true;
		data.fallbackFont = input;
	},

	/**
	 * Gets default font buffer for image rendering if it is set
	 *
	 * @returns A Promise which resolves to ArrayBuffer if default font is set,
	 * otherwise undefined
	 */
	get: async () => {
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
	},

	/**
	 * Check whether default font is set or not
	 *
	 * @returns true if default font is set, otherwise false
	 */
	has: () => Boolean(data.fallbackFont)
};
