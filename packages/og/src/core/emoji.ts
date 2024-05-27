import { cache } from './cache';
import { FetchError } from './errors';

/** Apis for loading emoji svg */
export const EMOJI_APIS = {
  openmoji: (code: string) => `https://cdn.jsdelivr.net/npm/@svgmoji/openmoji@2.0.0/svg/${code.toUpperCase()}.svg`,
  blobmoji: (code: string) => `https://cdn.jsdelivr.net/npm/@svgmoji/blob@2.0.0/svg/${code.toUpperCase()}.svg`,
  noto: (code: string) => `https://cdn.jsdelivr.net/gh/svgmoji/svgmoji/packages/svgmoji__noto/svg/${code.toUpperCase()}.svg`,
  twemoji: (code: string) => `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${code.toLowerCase()}.svg`,
  fluent: (code: string) => `https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${code.toLowerCase()}_color.svg`,
  fluentFlat: (code: string) => `https://cdn.jsdelivr.net/gh/shuding/fluentui-emoji-unicode/assets/${code.toLowerCase()}_flat.svg`,
};

/** Represents type of emoji */
export type EmojiType = keyof typeof EMOJI_APIS;

export const toCodePoint = (unicodeSurrogates: string) => {
  const r: string[] = [];
  let c = 0;
  let p = 0;
  let i = 0;
  while (i < unicodeSurrogates.length) {
    c = unicodeSurrogates.charCodeAt(i);
    i += 1;
    if (p) {
      r.push((65536 + ((p - 55296) << 10) + (c - 56320)).toString(16));
      p = 0;
    } else if (55296 <= c && c <= 56319) {
      p = c;
    } else {
      r.push(c.toString(16));
    }
  }
  return r.join('-');
};

const U200D = String.fromCharCode(8205);
const UFE0Fg = /\uFE0F/g;

export const getIconCode = (char: string) => toCodePoint(char.indexOf(U200D) < 0 ? char.replace(UFE0Fg, '') : char);

/** Emoji cache map */
export const EMOJI_CACHE_MAP = new Map<string, string>();

/** Default emoji type */
export const DEFAULT_EMOJI_TYPE: EmojiType = 'twemoji';

/**
 * A helper function for loading emoji svg
 *
 * @param code The emoji code
 * @param type The {@link EmojiType}
 * @param cacheStore The Cache to be used for caching svg responses
 *
 * @returns The emoji's svg as string
 */
export const loadEmoji = async (code: string, type?: EmojiType) => {
  const apiType = !type || !EMOJI_APIS[type] ? DEFAULT_EMOJI_TYPE : type;
  const api = EMOJI_APIS[apiType];

  const svgUrl = api(code);

  // Check if cache map has this emoji
  const fromMap = EMOJI_CACHE_MAP.get(svgUrl);

  if (fromMap) {
    return fromMap;
  }

  const response = await cache.serve(svgUrl, () =>
    fetch(svgUrl)
      .then((res) => {
        if (!res.ok) {
          throw new FetchError(`Response was not successful (status: \`${res.status}\`, statusText: \`${res.statusText}\`)`, { response: res });
        }
        return res;
      })
      .catch((e) => {
        throw new FetchError(`An error ocurred while fetching \`${svgUrl}\``, {
          cause: e,
          response: e instanceof FetchError ? e.response : undefined,
        });
      }),
  );

  // To suppress warnings in cloudflare devtools
  response.headers.set('content-type', 'text/xml');

  const svgCode = await response.text();

  // Put it to cache map
  EMOJI_CACHE_MAP.set(svgUrl, svgCode);

  return svgCode;
};
