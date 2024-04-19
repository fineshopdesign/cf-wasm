/* eslint-disable max-classes-per-file */
import { getCache } from "./cache";
import type { FontStyle, FontWeight } from "./satori";

export const fontCacheMap = new Map<string, ArrayBuffer>();

export const loadGoogleFont = async (
	family: string,
	{
		text,
		weight,
		italic = false,
		normal = true,
		display,
		cache
	}: {
		text?: string;
		weight?: string | number;
		italic?: boolean;
		normal?: boolean;
		display?: "auto" | "block" | "swap" | "fallback" | "optional";
		cache?: Cache;
	} = {}
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

	const cacheStore = cache ?? (await getCache());

	let cssResponse = await cacheStore
		.match(cssUrl)
		.then((res) => (res?.ok ? res : undefined));

	if (!cssResponse) {
		const fetchResponse = await fetch(cssUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"
			}
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error(
						`Response was not successful (status: ${res.status}, statusText: ${res.statusText})`
					);
				}
				return res;
			})
			.catch((e) => {
				throw new Error(
					`Failed to download dynamic font. An error ocurred while fetching ${cssUrl}`,
					{ cause: e }
				);
			});

		cssResponse = new Response(fetchResponse.body, fetchResponse);
		cssResponse.headers.append("Cache-Control", "s-maxage=3600");

		await cacheStore.put(cssUrl, cssResponse.clone());
	}

	const css = await cssResponse.text();
	const fontUrl = css.match(
		/src: url\((.+)\) format\('(opentype|truetype)'\)/
	)?.[1];

	if (!fontUrl) {
		throw new Error(`Failed to download dynamic font. No font was found.`);
	}

	let fontResponse = await cacheStore
		.match(fontUrl)
		.then((res) => (res?.ok ? res : undefined));

	if (!fontResponse) {
		const fetchResponse = await fetch(fontUrl)
			.then((res) => {
				if (!res.ok) {
					throw new Error(
						`Response was not successful (status: ${res.status}, statusText: ${res.statusText})`
					);
				}
				return res;
			})
			.catch((e) => {
				throw new Error(
					`Failed to download dynamic font. An error ocurred while fetching ${fontUrl}`,
					{ cause: e }
				);
			});

		fontResponse = new Response(fetchResponse.body, fetchResponse);
		fontResponse.headers.append("Cache-Control", "s-maxage=3600");

		await cacheStore.put(fontUrl, fontResponse.clone());
	}

	const buffer = await fontResponse.arrayBuffer();

	fontCacheMap.set(cssUrl, buffer);

	return buffer;
};

export type BaseFontOptions = {
	weight?: FontWeight;
	style?: FontStyle;
};

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

export type CustomFontOptions = BaseFontOptions & {
	lang?: string;
};

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

	get data() {
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

export type GoogleFontOptions = BaseFontOptions & {
	/**
	 * The name of the font (can be used for font-family css property)
	 */
	name?: string;

	/**
	 * Loads font only for particular text (for better performance)
	 */
	text?: string;
};

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
	 * A promise which resolves with font data as `ArrayBuffer`
	 */
	get data() {
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
}
