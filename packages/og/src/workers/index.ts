import * as resvg from '@cf-wasm/resvg/2.4.1/workers';
import * as satori from '@cf-wasm/satori/workers';
import { defaultFont, modules } from '../core';
import fallbackFont from '../core/noto-sans-v27-latin-regular.ttf.bin';

// Set modules
modules.resvg = resvg;
modules.satori = satori;

// Set default font
defaultFont.set(fallbackFont);

export {
  ImageResponse,
  CustomFont,
  GoogleFont,
  render,
  defaultFont,
  loadGoogleFont,
  cache,
  type ImageResponseOptions,
  type CustomFontOptions,
  type GoogleFontOptions,
  type EmojiType,
  type RenderOptions,
  type SvgResult,
  type PngResult,
  type Font,
  type FontStyle,
  type FontWeight,
  type RenderResvgOptions,
  type RenderSatoriOptions,
  type ResvgRenderOptions,
  type SatoriNode,
  type SatoriOptions,
} from '../core';
