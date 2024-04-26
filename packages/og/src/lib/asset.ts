import { type EmojiType, getIconCode, loadEmoji } from "./emoji";
import { FontDetector, languageFontMap } from "./language";
import { loadGoogleFont } from "./font";
import type { Font } from "./satori";

export const detector = new FontDetector();
export const assetCache = new Map<string, string | Font[]>();

/**
 * A helper function for loading dynamic assets requested by satori
 *
 * @param param0 Options
 *
 * @returns A callback function for loading assets
 */
export const loadDynamicAsset = ({ emoji }: { emoji?: EmojiType }) => {
	const load = async (languageCode: string, text: string) => {
		if (languageCode === "emoji") {
			return `data:image/svg+xml;base64,${btoa(
				await loadEmoji(getIconCode(text), emoji)
			)}`;
		}

		const codes = languageCode.split("|");
		const names = codes
			.map((code) => languageFontMap[code as keyof typeof languageFontMap])
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
			return fontData.map(
				(data, index) =>
					({
						name: `satori_${codes[index]}_fallback_${text}`,
						data,
						weight: 400,
						style: "normal",
						lang: codes[index] === "unknown" ? undefined : codes[index]
					}) as Font
			);
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
	): Promise<string | Font[]> => {
		const key = JSON.stringify([languageCode, text]);
		if (assetCache.has(key)) {
			const cache = assetCache.get(key);
			return cache ?? [];
		}
		const asset = await load(languageCode, text);
		assetCache.set(key, asset);
		return asset;
	};
};
