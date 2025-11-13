import type { ReactNode } from 'react';
import { loadDynamicAsset } from './asset';
import type { EmojiType } from './emoji';
import { CustomFont, defaultFont, type FontBuffer, GoogleFont } from './font';
import { SATORI_FONT_CACHE_MAP } from './maps';
import { modules } from './modules';
import type { ResvgRenderOptions } from './resvg';
import type { Font as SatoriFont, SatoriOptions, VNode } from './satori';
import type { MayBePromise, StringWithSuggestions } from './types';

/** Represents a png result of rendered image */
export interface PngResult {
  pixels: Uint8Array<ArrayBuffer>;

  /* Output image bytes */
  image: Uint8Array<ArrayBuffer>;

  /** The width of the image */
  width: number;

  /** The height of the image */
  height: number;

  /** The mime type of the image */
  type: string;
}

/** Represents a svg result of rendered image */
export interface SvgResult {
  /** The svg image as string */
  image: string;

  /** The width of the image */
  width: number;

  /** The height of the image */
  height: number;

  /** The mime type of the image */
  type: string;
}

export interface RenderSatoriOptions extends Omit<SatoriOptions, 'width' | 'height' | 'fonts' | 'loadAdditionalAsset' | 'debug'> {}

export interface RenderResvgOptions extends Omit<ResvgRenderOptions, 'fitTo'> {}

export type Font = Omit<SatoriFont, 'data'> & FontBuffer;

/** An interface representing options for {@link render} function */
export interface RenderOptions {
  /**
   * The width of the image.
   *
   * @default 1200
   */
  width?: number;

  /**
   * The height of the image.
   *
   * @default 630
   */
  height?: number;

  /**
   * Display debug information on the image.
   *
   * @default false
   */
  debug?: boolean;

  /** The default font to use */
  defaultFont?: FontBuffer;

  /**
   * A list of fonts to use.
   *
   * @default Noto Sans Latin Regular.
   */
  fonts?: Font[];

  /**
   * A callback function for loading dynamic assets requested by satori
   *
   * @param languageCode
   * The detected language codes separated using `|` (i.e: `ja-JP|zh-CN|zh-TW|zh-HK`, `devanagari`, etc.)
   *
   * `emoji` if it's an Emoji
   *
   * `unknown` if not able to tell.
   *
   * @param segment Content to render.
   * @param next A function which when called returns a Promise resolves to the next result
   */
  loadAdditionalAsset?: (
    languageCode: StringWithSuggestions<'emoji' | 'unknown'>,
    segment: string,
    next: () => Promise<string | Font[]>,
  ) => MayBePromise<undefined | string | Font[]>;

  /**
   * Using a specific Emoji style. Defaults to `twemoji`.
   *
   * @default 'twemoji'
   */
  emoji?: EmojiType;

  /**
   * The format of response, can be one of `svg` or `png`
   */
  format?: 'svg' | 'png';

  /**
   * Passes {@link RenderSatoriOptions} to satori
   */
  satoriOptions?: RenderSatoriOptions;

  /**
   * Passes {@link RenderResvgOptions} to resvg
   */
  resvgOptions?: RenderResvgOptions;
}

/** Default render options */
export const RENDER_DEFAULT_OPTIONS = {
  width: 1200,
  height: 630,
  debug: false,
  fonts: [],
};

/**
 * Renders {@link ReactNode} to image
 *
 * @param element The {@link ReactNode}
 * @param options The {@link RenderOptions}
 *
 * @returns An object containing methods for rendering the input element to image
 */
export function render(element: ReactNode | VNode, options: RenderOptions = {}) {
  const promises: {
    svg?: Promise<SvgResult>;
    png?: Promise<PngResult>;
    fonts?: Promise<SatoriOptions['fonts']>;
  } = {};

  const renderOptions = {
    ...RENDER_DEFAULT_OPTIONS,
    ...options,
  };

  const loadAdditionalAsset = async (languageCode: string, segment: string) => {
    const next = () => loadDynamicAsset(languageCode, segment, renderOptions?.emoji);

    let result: string | Font[] | undefined;
    if (options.loadAdditionalAsset) {
      result = await options.loadAdditionalAsset(languageCode, segment, next);
    }

    result ??= await next();

    if (Array.isArray(result)) {
      return await Promise.all(
        result.map(async (asset) => ({
          ...asset,
          data: await asset.data,
        })),
      );
    }

    return result;
  };

  const getFonts = async () => {
    const fallback = async (): Promise<SatoriOptions['fonts']> => {
      const defaultFonts: Font[] = [];

      const fallbackFont = await (renderOptions.defaultFont?.data ?? defaultFont.get());
      if (fallbackFont) {
        defaultFonts.push(
          new CustomFont('sans serif', fallbackFont, {
            weight: 400,
            style: 'normal',
          }),
        );
      } else {
        console.warn("(@cf-wasm/og) [ WARN ] No default font specified. Using 'Noto Sans' from Google Fonts as the fallback.");
        defaultFonts.push(
          new GoogleFont('Noto Sans', {
            name: 'sans serif',
            weight: 400,
            style: 'normal',
          }),
        );
      }

      return Promise.all(
        [...defaultFonts, ...renderOptions.fonts].map(async (font) => ({
          ...font,
          data: await font.data,
        })),
      ).then((fonts) =>
        /**
         * An attempt to improve performance by passing cached satori font object
         *
         * @see https://github.com/vercel/satori/issues/590
         */
        fonts.map((font) => {
          const key = `[${font.name}]:[${font.style || ''}]:[${font.weight || ''}]:[${font.lang || ''}]:[${font.data.byteLength}]`;
          const fromMap = SATORI_FONT_CACHE_MAP.get(key);
          if (fromMap) {
            return fromMap;
          }
          SATORI_FONT_CACHE_MAP.set(key, font);
          return font;
        }),
      );
    };

    promises.fonts = promises.fonts?.then(null, fallback) ?? fallback();
    return promises.fonts;
  };

  /**
   * Method to render the element as svg image
   *
   * @returns A promise which resolves to rendered svg image as {@link SvgResult}
   */
  const asSvg = async () => {
    const fallback = async (): Promise<SvgResult> => {
      const satoriFonts = await getFonts();

      const satoriOptions = {
        ...renderOptions.satoriOptions,
        width: renderOptions.width,
        height: renderOptions.height,
        debug: renderOptions.debug,
        fonts: satoriFonts,
        loadAdditionalAsset,
      };
      const svg = await modules.satori.satori(element, satoriOptions);

      return {
        image: svg,
        height: satoriOptions.height,
        width: satoriOptions.width,
        type: 'image/svg+xml',
      };
    };

    promises.svg = promises.svg?.then(null, fallback) ?? fallback();
    return promises.svg;
  };

  /**
   * Method to render the element as png image
   *
   * @returns A promise which resolves to rendered png image as {@link PngResult}
   */
  const asPng = async () => {
    const fallback = async (): Promise<PngResult> => {
      const svg = await asSvg();
      const resvg = await modules.resvg.Resvg.create(svg.image, {
        ...renderOptions.resvgOptions,
        fitTo: {
          mode: 'width',
          value: renderOptions.width,
        },
      });
      const renderedImage = resvg.render();

      const result: PngResult = {
        pixels: renderedImage.pixels as Uint8Array<ArrayBuffer>,
        image: renderedImage.asPng() as Uint8Array<ArrayBuffer>,
        width: renderedImage.width,
        height: renderedImage.height,
        type: 'image/png',
      };

      // Explicitly free rust memory
      renderedImage.free();
      resvg.free();

      return result;
    };

    promises.png = promises.png?.then(null, fallback) ?? fallback();
    return promises.png;
  };

  return { asSvg, asPng };
}
