import * as resvg from '@cf-wasm/resvg/legacy/others';
import * as satori from '@cf-wasm/satori/others';
import { defaultFont, GoogleFont, modules } from './core';

// Set modules
modules.set(resvg, satori);

// Set default font
defaultFont.set(
  new GoogleFont('Noto Sans', {
    name: 'sans serif',
    weight: 400,
    style: 'normal',
  }),
);

export {
  CustomFont,
  type CustomFontOptions,
  cache,
  defaultFont,
  type EmojiType,
  FetchError,
  type Font,
  type FontDisplay,
  type FontStyle,
  type FontWeight,
  GoogleFont,
  type GoogleFontOptions,
  googleFonts,
  ImageResponse,
  type ImageResponseOptions,
  type Locale,
  loadGoogleFont,
  type PngResult,
  type RenderOptions,
  type RenderResvgOptions,
  type RenderSatoriOptions,
  type ResvgRenderOptions,
  render,
  type SatoriNode,
  type SatoriOptions,
  type SvgResult,
} from './core';
