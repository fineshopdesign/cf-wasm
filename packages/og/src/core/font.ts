import { cache } from './cache';
import { FetchError } from './errors';
import { FONT_CACHE_MAP } from './maps';
import type { FontStyle, FontWeight } from './satori';
import type { MayBePromise } from './types';

export type FontDisplay = 'auto' | 'block' | 'swap' | 'fallback' | 'optional';

/** An interface representing options for {@link loadGoogleFont} function */
export interface LoadGoogleFontOptions {
  text?: string;

  /** The font weight to load */
  weight?: string | number;

  /** The font style to load */
  style?: FontStyle;

  /** The `font-display` */
  display?: FontDisplay;
}

/** Default user agent for loading css */
export const GOOGLE_FONT_CSS_DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_8; de-at) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1';

/** Google fonts utils */
class GoogleFontsUtils {
  /** Default Google font css loader */
  private _defaultCssLoader: (cssUrl: string, userAgent: string) => MayBePromise<string> = async (cssUrl, userAgent) => {
    const cssResponse = await cache.serve(cssUrl, () =>
      fetch(cssUrl, {
        headers: {
          'User-Agent': userAgent,
        },
      })
        .then((res) => {
          if (!res.ok) {
            throw new FetchError(`Response was not successful (status: \`${res.status}\`, statusText: \`${res.statusText}\`)`, { response: res });
          }
          return res;
        })
        .catch((e) => {
          throw new FetchError(`An error ocurred while fetching \`${cssUrl}\``, {
            cause: e,
            response: e instanceof FetchError ? e.response : undefined,
          });
        }),
    );

    return cssResponse.text();
  };

  /** Google font css loader */
  private _cssLoader: (cssUrl: string, userAgent: string) => MayBePromise<string | undefined> = this._defaultCssLoader;

  /**
   * Loads Google font css
   *
   * @param cssUrl The Google font css url
   * @param userAgent The user agent header to be used
   *
   * @returns On success, the css as string
   */
  async loadCss(cssUrl: string, userAgent = GOOGLE_FONT_CSS_DEFAULT_USER_AGENT) {
    let css = await this._cssLoader(cssUrl, userAgent);
    if (typeof css === 'undefined') {
      css = await this._defaultCssLoader(cssUrl, userAgent);
    } else if (typeof css !== 'string') {
      throw new Error('Google font css loader return value must resolve to string');
    }
    return css;
  }

  /**
   * Sets Google font css loader
   *
   * @param loader The {@link GoogleFontCssLoader}
   */
  setCssLoader(loader: (cssUrl: string, userAgent: string) => MayBePromise<string | undefined>) {
    if (typeof loader !== 'function') {
      throw new TypeError('Argument 1 must be a function.');
    }
    this._cssLoader = loader;
  }
}

export const googleFonts = new GoogleFontsUtils();

/** Constructs Google font css url */
export const constructGoogleFontCssUrl = (
  family: string,
  { text, weight = 400, style = 'normal', display }: { text?: string; weight?: string | number; style?: FontStyle; display?: FontDisplay } = {},
) => {
  if (typeof family !== 'string' || family.trim().length === 0) {
    throw new Error('Not a valid font family name was provided');
  }

  const params: Record<string, string> = {
    family: `${family.replaceAll(' ', '+')}:${style === 'italic' ? 'ital,' : ''}wght@${style === 'italic' ? '1,' : ''}${weight}`,
  };

  if (text) {
    params.text = encodeURIComponent(text);
  } else {
    params.subset = 'latin';
  }

  if (typeof display === 'string') {
    params.display = display;
  }

  const cssUrl = `https://fonts.googleapis.com/css2?${Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .join('&')}`;

  return cssUrl;
};

/**
 * A helper function for loading google fonts as {@link ArrayBuffer}
 *
 * @param family The name of the font family
 * @param param1 Options
 *
 * @returns A promise which resolved to {@link ArrayBuffer}
 */
export const loadGoogleFont = async (family: string, { text, weight = 400, style = 'normal', display }: LoadGoogleFontOptions = {}) => {
  const cssUrl = constructGoogleFontCssUrl(family, { text, weight, display, style });

  const fromMap = FONT_CACHE_MAP.get(cssUrl);

  if (fromMap) {
    return fromMap;
  }

  const css = await googleFonts.loadCss(cssUrl);

  const fontUrl = css.match(/src: url\((.+)\) format\('(opentype|truetype)'\)/)?.[1];

  if (!fontUrl) {
    throw new Error('The css does not content source for truetype font.');
  }

  const fontResponse = await cache.serve(fontUrl, () =>
    fetch(fontUrl)
      .then((res) => {
        if (!res.ok) {
          throw new FetchError(`Response was not successful (status: ${res.status}, statusText: ${res.statusText})`, { response: res });
        }
        return res;
      })
      .catch((e) => {
        throw new FetchError(`An error ocurred while fetching ${fontUrl}`, {
          cause: e,
          response: e instanceof FetchError ? e.response : undefined,
        });
      }),
  );

  const buffer = await fontResponse.arrayBuffer();

  FONT_CACHE_MAP.set(cssUrl, buffer);

  return buffer;
};

/** Base font options */
export interface BaseFontOptions {
  weight?: FontWeight;
  style?: FontStyle;
}

/** Base font class */
export class BaseFont {
  protected input;

  name: string;
  style: FontStyle;
  weight: FontWeight;

  constructor(
    name: string,
    input: MayBePromise<Buffer | ArrayBuffer> | (() => MayBePromise<Buffer | ArrayBuffer>) | undefined,
    { weight = 400, style = 'normal' }: BaseFontOptions = {},
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

/** An interface representing options for {@link CustomFont} */
export interface CustomFontOptions extends BaseFontOptions {
  lang?: string;
}

/** A helper class to load Custom font */
export class CustomFont extends BaseFont {
  protected input: MayBePromise<Buffer | ArrayBuffer> | (() => MayBePromise<Buffer | ArrayBuffer>);

  private promise?: Promise<Buffer | ArrayBuffer>;

  type: 'custom';
  lang: string | undefined;

  /**
   * Creates an instance of {@link CustomFont}
   *
   * @param name The name of the font (can be used for font-family css property)
   * @param input Font data as `ArrayBuffer` or a promise which resolves to `ArrayBuffer`
   * @param options
   */
  constructor(name: string, input: MayBePromise<Buffer | ArrayBuffer> | (() => MayBePromise<Buffer | ArrayBuffer>), options?: CustomFontOptions) {
    super(name, input, options);
    this.type = 'custom';
    this.input = input;
    this.lang = options?.lang;
  }

  /**
   * A promise which resolves to font data as `ArrayBuffer`
   */
  get data(): Promise<Buffer | ArrayBuffer> {
    const fallback = async () => (typeof this.input === 'function' ? this.input() : this.input);
    this.promise = this.promise?.then(null, fallback) ?? fallback();
    return this.promise;
  }
}

/** An interface representing options for {@link GoogleFont} */
export interface GoogleFontOptions extends BaseFontOptions {
  /** The name of the font (can be used for font-family css property) */
  name?: string;

  /** Loads font only for particular text (for better performance) */
  text?: string;
}

/** A helper class to load Google font */
export class GoogleFont extends BaseFont {
  protected input: Promise<ArrayBuffer> | undefined;

  private promise?: Promise<ArrayBuffer>;

  type: 'google';

  /** The font family name */
  family: string;

  /** Text for which the font is loaded */
  text: string | undefined;

  /**
   * Creates an instance of {@link GoogleFont}
   *
   * @param family The name of font family to load
   * @param options The {@link GoogleFontOptions}
   */
  constructor(family: string, options: GoogleFontOptions = {}) {
    super(options.name || family, undefined, options);
    this.type = 'google';
    this.family = family;
    this.text = options.text;
    this.input = undefined;
  }

  /** A promise which resolves to font data as `ArrayBuffer` */
  get data(): Promise<ArrayBuffer> {
    const fallback = async () =>
      loadGoogleFont(this.family, {
        weight: this.weight,
        style: this.style,
        text: this.text,
      });
    this.promise = this.promise?.then(null, fallback) ?? fallback();
    return this.promise;
  }

  /**
   * Checks whether font can load buffer
   *
   * @returns On success, true otherwise the error object thrown
   */
  async canLoad() {
    try {
      await this.data;
    } catch (e) {
      return e;
    }
    return true;
  }
}

export interface FontBuffer {
  data: MayBePromise<Buffer | ArrayBuffer>;
}

export type FontInput = MayBePromise<Response | Buffer | ArrayBuffer | FontBuffer>;

/** Default font utils */
class DefaultFont {
  private _input?: FontInput | (() => FontInput);
  private _data?: Buffer | ArrayBuffer;
  private _shouldResolve = true;

  /**
   * Sets default font for image rendering
   *
   * @param input {@link FontInput}
   */
  set(input: FontInput | (() => FontInput)) {
    if (!input) {
      throw new TypeError('Argument 1 type is not acceptable');
    }
    this._shouldResolve = true;
    this._input = input;
  }

  /**
   * Gets default font buffer for image rendering if it is set
   *
   * @returns A Promise which resolves to ArrayBuffer if default font is set,
   * otherwise undefined
   */
  async get() {
    let buffer: Buffer | ArrayBuffer | undefined;

    if (this._shouldResolve && this._input) {
      const input = typeof this._input === 'function' ? await this._input() : await this._input;
      if (input instanceof Response) {
        buffer = await input.arrayBuffer();
      } else if ('data' in input) {
        buffer = await input.data;
      } else {
        buffer = input;
      }
    } else if (this._data) {
      buffer = this._data;
    }

    this._data = buffer;
    this._shouldResolve = false;

    return buffer;
  }

  /**
   * Check whether default font is set or not
   *
   * @returns true if default font is set, otherwise false
   */
  has() {
    return Boolean(this._input);
  }
}

export const defaultFont = new DefaultFont();
