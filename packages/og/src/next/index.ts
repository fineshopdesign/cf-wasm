import * as resvg from '@cf-wasm/resvg/2.4.1/next';
import * as satori from '@cf-wasm/satori/next';
import { defaultFont, modules } from '../core';

// Set modules
modules.set(resvg, satori);

// Set default font
defaultFont.set(() => fetch(new URL('../core/noto-sans-v27-latin-regular.ttf.bin', import.meta.url)).then((res) => res.arrayBuffer()));

export {
  ImageResponse,
  CustomFont,
  GoogleFont,
  render,
  googleFonts,
  defaultFont,
  loadGoogleFont,
  cache,
  FetchError,
  type ImageResponseOptions,
  type CustomFontOptions,
  type GoogleFontOptions,
  type EmojiType,
  type RenderOptions,
  type SvgResult,
  type PngResult,
  type Font,
  type FontDisplay,
  type FontStyle,
  type FontWeight,
  type RenderResvgOptions,
  type RenderSatoriOptions,
  type ResvgRenderOptions,
  type SatoriNode,
  type SatoriOptions,
  type Locale,
} from '../core';
