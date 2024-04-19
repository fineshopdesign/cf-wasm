import { cachedAssetResponse } from "./cache";

export const languageFontMap = {
	"ja-JP": "Noto+Sans+JP",
	"ko-KR": "Noto+Sans+KR",
	"zh-CN": "Noto+Sans+SC",
	"zh-TW": "Noto+Sans+TC",
	"zh-HK": "Noto+Sans+HK",
	"th-TH": "Noto+Sans+Thai",
	"bn-IN": "Noto+Sans+Bengali",
	"ar-AR": "Noto+Sans+Arabic",
	"ta-IN": "Noto+Sans+Tamil",
	"ml-IN": "Noto+Sans+Malayalam",
	"he-IL": "Noto+Sans+Hebrew",
	"te-IN": "Noto+Sans+Telugu",
	devanagari: "Noto+Sans+Devanagari",
	kannada: "Noto+Sans+Kannada",
	symbol: ["Noto+Sans+Symbols", "Noto+Sans+Symbols+2"],
	math: "Noto+Sans+Math",
	unknown: "Noto+Sans"
};

export const convert = (input: string) =>
	input.split(", ").map((r) => {
		const range = r.replaceAll("U+", "");
		const [start, end] = range.split("-").map((hex) => parseInt(hex, 16));

		return Number.isNaN(end) ? start : [start, end];
	});

export const checkSegmentInRange = (
	segment: string,
	range: (number | number[])[]
) => {
	const codePoint = segment.codePointAt(0);
	if (!codePoint) return false;
	return range.some((val) => {
		if (typeof val === "number") {
			return codePoint === val;
		}
		const [start, end] = val;
		return start <= codePoint && codePoint <= end;
	});
};

export class FontDetector {
	private rangesByLang: Record<string, (number | number[])[]>;

	constructor() {
		this.rangesByLang = {};
	}

	private addDetectors(input: string) {
		const regex = /font-family:\s*'(.+?)';.+?unicode-range:\s*(.+?);/gms;
		const matches = input.matchAll(regex);
		// eslint-disable-next-line no-restricted-syntax
		for (const [, _lang, range] of matches) {
			const lang = _lang.replaceAll(" ", "+");
			if (!this.rangesByLang[lang]) {
				this.rangesByLang[lang] = [];
			}
			this.rangesByLang[lang].push(...convert(range));
		}
	}

	private detectSegment(segment: string, fonts: string[]) {
		for (let i = 0; i < fonts.length; i += 1) {
			const font = fonts[i];
			const range = this.rangesByLang[font];
			if (range && checkSegmentInRange(segment, range)) {
				return font;
			}
		}
		return null;
	}

	private async load(fonts: string[], cache?: Cache) {
		let params = "";

		const existingLang = Object.keys(this.rangesByLang);
		const langNeedsToLoad = fonts.filter(
			(font) => !existingLang.includes(font)
		);

		if (langNeedsToLoad.length === 0) {
			return;
		}

		for (let i = 0; i < langNeedsToLoad.length; i += 1) {
			params += `family=${langNeedsToLoad[i]}&`;
		}
		params += "display=swap";

		const cssUrl = `https://fonts.googleapis.com/css2?${params}`;

		const response = await cachedAssetResponse(
			cssUrl,
			() =>
				fetch(cssUrl, {
					headers: {
						"User-Agent":
							"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
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
						throw new Error(`An error ocurred while fetching ${cssUrl}`, {
							cause: e
						});
					}),
			{
				cache
			}
		);

		const fontFace = await response.text();
		this.addDetectors(fontFace);
	}

	public async detect(text: string, fonts: string[]) {
		await this.load(fonts);
		const result: Record<string, string> = {};
		for (let i = 0; i < text.length; i += 1) {
			const segment = text.charAt(i);
			const lang = this.detectSegment(segment, fonts);
			if (lang) {
				result[lang] = result[lang] || "";
				result[lang] += segment;
			}
		}
		return result;
	}
}
