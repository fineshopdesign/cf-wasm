import * as resvg from '@cf-wasm/resvg/legacy/next';
import * as satori from '@cf-wasm/satori/next';
import { defaultFont, modules } from './core';

// Set modules
modules.set(resvg, satori);

// Set default font
defaultFont.set(() => fetch(new URL('./core/noto-sans-v27-latin-regular.ttf.bin', import.meta.url)).then((res) => res.arrayBuffer()));

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
