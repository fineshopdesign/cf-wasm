import { type EmojiType, getIconCode, loadEmoji } from "./emoji";
import { FontDetector, languageFontMap } from "./language";
import { loadGoogleFont } from "./font";

export type DynamicAsset = {
	name: string;
	data: ArrayBuffer;
	weight: number;
	style: string;
	lang: string | undefined;
};

export const detector = new FontDetector();
export const assetCache = new Map<string, string | DynamicAsset[]>();

export const loadDynamicAsset = ({ emoji }: { emoji?: EmojiType }) => {
	const fn = async (languageCode: string, text: string) => {
		if (languageCode === "emoji") {
			return `data:image/svg+xml;base64,${btoa(
				await loadEmoji(getIconCode(text), emoji)
			)}`;
		}

		const codes = languageCode.split("|");
		const names = codes
			.map((code2) => languageFontMap[code2 as keyof typeof languageFontMap])
			.filter(Boolean)
			.flat();
		if (names.length === 0) {
			return [];
		}

		try {
			const textByFont = await detector.detect(text, names);
			const fonts = Object.keys(textByFont);
			const fontData = await Promise.all(
				fonts.map((font) =>
					loadGoogleFont(font, {
						text: textByFont[font],
						weight: 400
					})
				)
			);
			return fontData.map((data, index) => {
				const asset = {
					name: `satori_${codes[index]}_fallback_${text}`,
					data,
					weight: 400,
					style: "normal",
					lang: codes[index] === "unknown" ? undefined : codes[index]
				};
				return asset;
			});
		} catch (e) {
			console.warn(
				"(@cf-wasm/og) [ WARN ] Failed to load dynamic font for",
				text,
				".\n",
				e
			);
		}
		return [];
	};

	return async (
		languageCode: string,
		text: string
	): Promise<string | DynamicAsset[]> => {
		const key = JSON.stringify([languageCode, text]);
		if (assetCache.has(key)) {
			const cache = assetCache.get(key);
			return cache ?? [];
		}
		const asset = await fn(languageCode, text);
		assetCache.set(key, asset);
		return asset;
	};
};
