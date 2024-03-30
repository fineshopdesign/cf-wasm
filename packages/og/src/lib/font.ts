/* eslint-disable max-classes-per-file */
import { getCache } from "./cache";
import { FontStyle, FontWeight } from "./satori";

export const fontCacheMap = new Map<string, ArrayBuffer>();

export const loadGoogleFont = async (
	family: string,
	{
		text,
		weight,
		italic = false,
		normal = true,
		cache
	}: {
		text?: string;
		weight?: string | number;
		italic?: boolean;
		normal?: boolean;
		cache?: Cache;
	} = {}
) => {
	if (!family) {
		throw new Error(`No font family name was provided`);
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

	const cssUrl = `https://fonts.googleapis.com/css2?${Object.keys(params)
		.map((key) => `${key}=${params[key]}`)
		.join("&")}`;

	const fromMap = fontCacheMap.get(cssUrl);

	if (fromMap) {
		return fromMap;
	}

	const cacheStore = cache ?? (await getCache());

	let cssResponse = await cacheStore.match(cssUrl);

	if (!cssResponse) {
		const fetchResponse = await fetch(cssUrl, {
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"
			}
		});

		cssResponse = new Response(fetchResponse.body, fetchResponse);
		cssResponse.headers.append("Cache-Control", "s-maxage=3600");

		await cacheStore.put(cssUrl, cssResponse.clone());
	}

	if (!cssResponse.ok) {
		throw new Error(
			`Failed to download dynamic font. Error while fetching ${cssUrl} (status: ${cssResponse.status})`
		);
	}

	const css = await cssResponse.text();
	const fontUrl = css.match(
		/src: url\((.+)\) format\('(opentype|truetype)'\)/
	)?.[1];

	if (!fontUrl) {
		throw new Error(`Failed to download dynamic font. No font was found.`);
	}

	let fontResponse = await cacheStore.match(fontUrl);

	if (!fontResponse) {
		const fetchResponse = await fetch(fontUrl);

		fontResponse = new Response(fetchResponse.body, fetchResponse);
		fontResponse.headers.append("Cache-Control", "s-maxage=3600");

		await cacheStore.put(fontUrl, fontResponse.clone());
	}

	if (!fontResponse.ok) {
		throw new Error(
			`Failed to download dynamic font. Error while fetching ${fontUrl} (status: ${fontResponse.status})`
		);
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
	protected buffer: ArrayBuffer | Promise<ArrayBuffer> | undefined;

	name: string;

	style: FontStyle;

	weight: FontWeight;

	constructor(
		name: string,
		data: ArrayBuffer | Promise<ArrayBuffer> | undefined,
		{ weight = 400, style = "normal" }: BaseFontOptions = {}
	) {
		this.buffer = data;
		this.name = name;
		this.style = style;
		this.weight = weight;
	}

	get data() {
		return this.buffer;
	}
}

export type CustomFontOptions = BaseFontOptions;

export class CustomFont extends BaseFont {
	protected buffer: ArrayBuffer | Promise<ArrayBuffer>;

	constructor(
		name: string,
		data: ArrayBuffer | Promise<ArrayBuffer>,
		options?: CustomFontOptions
	) {
		super(name, data, options);
		this.buffer = data;
	}

	get data() {
		return this.buffer;
	}
}

export type GoogleFontOptions = BaseFontOptions & {
	name?: string;
	text?: string;
};

export class GoogleFont extends BaseFont {
	protected buffer: Promise<ArrayBuffer> | undefined;

	family: string;

	text: string | undefined;

	constructor(family: string, options: GoogleFontOptions = {}) {
		super(options.name || family, undefined, options);
		this.family = family;
		this.text = options.text;
		this.buffer = undefined;
	}

	get data() {
		if (this.buffer) {
			this.buffer.catch(() => {
				this.buffer = undefined;
			});
		} else {
			this.buffer = loadGoogleFont(this.family, {
				weight: this.weight,
				italic: this.style === "italic",
				normal: this.style === "normal",
				text: this.text
			});
		}

		return this.buffer;
	}
}
