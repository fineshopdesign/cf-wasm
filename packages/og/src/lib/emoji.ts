import { cache } from "./cache";
import { FetchError } from "./errors";

const U200D = String.fromCharCode(8205);
const UFE0Fg = /\uFE0F/g;

// Apis for loading emoji svg
export const apis = {
	openmoji: (code: string) =>
		`https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/${code.toUpperCase()}.svg`,
	blobmoji: (code: string) =>
		`https://cdn.jsdelivr.net/npm/@svgmoji/blob@2.0.0/svg/${code.toUpperCase()}.svg`,
	noto: (code: string) =>
		`https://cdn.jsdelivr.net/gh/svgmoji/svgmoji/packages/svgmoji__noto/svg/${code.toUpperCase()}.svg`,
	twemoji: (code: string) =>
		`https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code.toLowerCase()}.svg`,
	fluent: (code: string) =>
		`https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${code.toLowerCase()}_color.svg`,
	fluentFlat: (code: string) =>
		`https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${code.toLowerCase()}_flat.svg`
};

/**
 * Represents type of emoji
 */
export type EmojiType = keyof typeof apis;

export const toCodePoint = (unicodeSurrogates: string) => {
	const r: string[] = [];
	let c = 0;
	let p = 0;
	let i = 0;
	while (i < unicodeSurrogates.length) {
		c = unicodeSurrogates.charCodeAt(i);
		i += 1;
		if (p) {
			// eslint-disable-next-line no-bitwise
			r.push((65536 + ((p - 55296) << 10) + (c - 56320)).toString(16));
			p = 0;
			// eslint-disable-next-line yoda
		} else if (55296 <= c && c <= 56319) {
			p = c;
		} else {
			r.push(c.toString(16));
		}
	}
	return r.join("-");
};

export const getIconCode = (char: string) =>
	toCodePoint(char.indexOf(U200D) < 0 ? char.replace(UFE0Fg, "") : char);

export const emojiCacheMap = new Map<string, string>();

/**
 * A helper function for loading emoji svg
 *
 * @param code The emoji code
 * @param type The {@link EmojiType}
 * @param cacheStore The Cache to be used for caching svg responses
 *
 * @returns The emoji's svg as string
 */
export const loadEmoji = async (
	code: string,
	type?: EmojiType,
	cacheStore?: Cache
) => {
	const apiType = !type || !apis[type] ? "twemoji" : type;
	const api = apis[apiType];

	const svgUrl = api(code);

	const fromMap = emojiCacheMap.get(svgUrl);

	if (fromMap) {
		return fromMap;
	}

	const response = await cache.serve(
		svgUrl,
		() =>
			fetch(svgUrl)
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
						`Failed to download dynamic emoji. An error ocurred while fetching ${svgUrl}`,
						{
							cause: e,
							response: e instanceof FetchError ? e.response : undefined
						}
					);
				}),
		{ cache: cacheStore }
	);

	// To hide warnings in cloudflare devtools
	response.headers.set("content-type", "text/xml");

	const text = await response.text();

	emojiCacheMap.set(svgUrl, text);

	return text;
};
