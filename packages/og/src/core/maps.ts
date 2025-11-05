import type { Font } from './satori';

/** Assets cache map */
export const ASSET_CACHE_MAP = new Map<string, string | Font[]>();

/** Emoji cache map */
export const EMOJI_CACHE_MAP = new Map<string, string>();

/** Font cache map */
export const FONT_CACHE_MAP = new Map<string, ArrayBuffer>();

/** Satori font cache map */
export const SATORI_FONT_CACHE_MAP = new Map<string, Font>();
