import { type EmojiType, getIconCode, loadEmoji } from './emoji';
import { loadGoogleFont } from './font';
import { FontDetector, LANGUAGE_FONT_MAP } from './language';
import { ASSET_CACHE_MAP } from './maps';
import type { Font } from './satori';
import type { StringWithSuggestions } from './types';

/** Font detector */
export const DETECTOR = new FontDetector();

/** Loads dynamic asset requested by satori without caching */
// `languageCode` will be the detected language code separated using `|` (i.e: `ja-JP|zh-CN|zh-TW|zh-HK`, `devanagari`), `emoji` if it's an Emoji, or `unknown` if not able to tell.
// `segment` will be the content to render.
export async function loadSatoriAsset(
  languageCode: StringWithSuggestions<'emoji' | 'unknown'>,
  segment: string,
  emoji?: EmojiType,
): Promise<string | Font[]> {
  if (languageCode === 'emoji') {
    return `data:image/svg+xml;base64,${btoa(await loadEmoji(getIconCode(segment), emoji))}`;
  }

  const codes = languageCode.split('|');
  const names = codes
    .map((code) => LANGUAGE_FONT_MAP[code as keyof typeof LANGUAGE_FONT_MAP])
    .filter(Boolean)
    .flat();

  if (names.length !== 0) {
    try {
      const textByFont = await DETECTOR.detect(segment, names);
      const fonts = Object.keys(textByFont);
      const fontData = await Promise.all(
        fonts.map((font) =>
          loadGoogleFont(font, {
            text: textByFont[font],
            weight: 400,
          }),
        ),
      );

      return fontData.map((data, index) => ({
        name: `satori_${codes[index]}_fallback_${segment}`,
        data,
        weight: 400,
        style: 'normal',
        lang: codes[index] === 'unknown' ? undefined : codes[index],
      }));
    } catch (e) {
      console.warn(`(@cf-wasm/og) [ WARN ] Failed to load dynamic font for segment \`${segment}\`.\n`, e);
    }
  }

  return [];
}

/**
 * Loads dynamic assets requested by satori
 *
 * @param languageCode The language code
 * @param segment The text
 * @param emoji The {@link EmojiType}
 *
 * @returns On success, the asset as either string or {@link Font}
 */
export async function loadDynamicAsset(
  languageCode: StringWithSuggestions<'emoji' | 'unknown'>,
  segment: string,
  emoji?: EmojiType,
): Promise<string | Font[]> {
  /** Get a key from input */
  const key = JSON.stringify([languageCode, segment]);
  if (ASSET_CACHE_MAP.has(key)) {
    const cache = ASSET_CACHE_MAP.get(key);
    return cache ?? [];
  }
  const asset = await loadSatoriAsset(languageCode, segment, emoji);
  ASSET_CACHE_MAP.set(key, asset);
  return asset;
}
