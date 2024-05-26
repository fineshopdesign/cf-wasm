import type { ReactElement } from 'react';
import { loadDynamicAsset } from './asset';
import type { EmojiType } from './emoji';
import { CustomFont, type FontBuffer, GoogleFont, defaultFont } from './font';
import { modules } from './modules';
import type { ResvgRenderOptions } from './resvg';
import type { Font as SatoriFont, SatoriOptions } from './satori';

/** Represents a png result of render function */
export interface PngResult {
  pixels: Uint8Array;
  image: Uint8Array;

  /** The width of the image */
  width: number;

  /** The height of the image */
  height: number;
}

/** Represents a svg result of render function */
export interface SvgResult {
  /** The svg image as string */
  image: string;

  /** The width of the image */
  width: number;

  /** The height of the image */
  height: number;
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

/** Default options */
const DEFAULT_OPTIONS = {
  width: 1200,
  height: 630,
  debug: false,
  fonts: [],
};

/**
 * Renders {@link ReactElement} to image
 *
 * @param element The {@link ReactElement}
 * @param options The {@link RenderOptions}
 *
 * @returns An object containing methods for rendering the input element to image
 */
export const render = (element: ReactElement, options: RenderOptions = {}) => {
  const data: {
    svg: SvgResult | null;
    png: PngResult | null;
    fonts: SatoriOptions['fonts'] | null;
  } = {
    svg: null,
    png: null,
    fonts: null,
  };

  const renderOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const getFonts = async () => {
    if (!data.fonts) {
      const fallbackFont = await (renderOptions.defaultFont?.data ?? defaultFont.get());

      if (!fallbackFont) {
        console.warn("(@cf-wasm/og) [ WARN ] No default font was provided, fetching 'Noto Sans' from Google fonts and setting as default font");
      }

      const defaultFonts = [
        fallbackFont
          ? new CustomFont('sans serif', fallbackFont, {
              weight: 400,
              style: 'normal',
            })
          : new GoogleFont('Noto Sans', {
              name: 'sans serif',
              weight: 400,
              style: 'normal',
            }),
      ];

      const satoriFonts: SatoriOptions['fonts'] = await Promise.all(
        [...defaultFonts, ...renderOptions.fonts].map(async (font) => ({
          ...font,
          data: await font.data,
        })),
      );

      data.fonts = satoriFonts;
    }

    return data.fonts;
  };

  /**
   * Method to render the element as svg image
   *
   * @returns A promise which resolves to rendered svg image as {@link SvgResult}
   */
  const asSvg = async () => {
    if (!data.svg) {
      const satoriFonts = await getFonts();

      const satoriOptions = {
        ...renderOptions.satoriOptions,
        width: renderOptions.width,
        height: renderOptions.height,
        debug: renderOptions.debug,
        fonts: satoriFonts,
        loadAdditionalAsset: loadDynamicAsset({
          emoji: renderOptions?.emoji,
        }),
      };
      const svg = await modules.satori.satori(element, satoriOptions);

      data.svg = {
        image: svg,
        height: satoriOptions.height,
        width: satoriOptions.width,
      };
    }

    return data.svg;
  };

  /**
   * Method to render the element as png image
   *
   * @returns A promise which resolves to rendered png image as {@link PngResult}
   */
  const asPng = async () => {
    if (!data.png) {
      const svg = await asSvg();
      const resvg = await modules.resvg.Resvg.create(svg.image, {
        ...renderOptions.resvgOptions,
        fitTo: {
          mode: 'width',
          value: renderOptions.width,
        },
      });
      const renderedImage = resvg.render();

      data.png = {
        pixels: renderedImage.pixels,
        image: renderedImage.asPng(),
        width: renderedImage.width,
        height: renderedImage.height,
      };

      // Explicitly free rust memory
      renderedImage.free();
      resvg.free();
    }

    return data.png;
  };

  return { asSvg, asPng };
};
