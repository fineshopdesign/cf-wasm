import { type EmojiType, getIconCode, loadEmoji } from './emoji';
import { loadGoogleFont } from './font';
import { FontDetector, LANGUAGE_FONT_MAP } from './language';
import type { Font } from './satori';

const DETECTOR = new FontDetector();
const ASSET_CACHE_MAP = new Map<string, string | Font[]>();

/**
 * A helper function for loading dynamic assets requested by satori
 *
 * @param param0 Options
 *
 * @returns A callback function for loading assets
 */
export const loadDynamicAsset = ({ emoji }: { emoji?: EmojiType }) => {
  const load = async (languageCode: string, text: string) => {
    if (languageCode === 'emoji') {
      return `data:image/svg+xml;base64,${btoa(await loadEmoji(getIconCode(text), emoji))}`;
    }

    const codes = languageCode.split('|');
    const names = codes
      .map((code) => LANGUAGE_FONT_MAP[code as keyof typeof LANGUAGE_FONT_MAP])
      .filter(Boolean)
      .flat();
    if (names.length === 0) {
      return [];
    }

    try {
      const textByFont = await DETECTOR.detect(text, names);
      const fonts = Object.keys(textByFont);
      const fontData = await Promise.all(
        fonts.map((font) =>
          loadGoogleFont(font, {
            text: textByFont[font],
            weight: 400,
          }),
        ),
      );
      return fontData.map(
        (data, index) =>
          ({
            name: `satori_${codes[index]}_fallback_${text}`,
            data,
            weight: 400,
            style: 'normal',
            lang: codes[index] === 'unknown' ? undefined : codes[index],
          }) as Font,
      );
    } catch (e) {
      console.warn('(@cf-wasm/og) [ WARN ] Failed to load dynamic font for', text, '.\n', e);
    }
    return [];
  };

  return async (languageCode: string, text: string): Promise<string | Font[]> => {
    const key = JSON.stringify([languageCode, text]);
    if (ASSET_CACHE_MAP.has(key)) {
      const cache = ASSET_CACHE_MAP.get(key);
      return cache ?? [];
    }
    const asset = await load(languageCode, text);
    ASSET_CACHE_MAP.set(key, asset);
    return asset;
  };
};
