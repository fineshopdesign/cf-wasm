import * as resvg from '@cf-wasm/resvg/2.4.1/workers';
import * as satori from '@cf-wasm/satori/workers';
import { defaultFont, modules } from '../core';
import fallbackFont from '../core/noto-sans-v27-latin-regular.ttf.bin';

// Set modules
modules.set(resvg, satori);

// Set default font
defaultFont.set(fallbackFont);

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
} from '../core';
