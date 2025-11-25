import * as resvg from '@cf-wasm/resvg/legacy/edge-light';
import * as satori from '@cf-wasm/satori/edge-light';
import { defaultFont, modules } from './core';
import fallbackFont from './lib/noto-sans-v27-latin-regular.ttf.bin.inline';

// Set modules
modules.set(resvg, satori);

// Set default font
/*
defaultFont.set(async () => {
  try {
    const response = await fetch(new URL('./lib/noto-sans-v27-latin-regular.ttf.bin', import.meta.url));
    return await response.arrayBuffer();
  } catch (_e) {
    console.warn("(@cf-wasm/og) [ WARN ] Failed to load default font. Using 'Noto Sans' from Google Fonts as the fallback.");
    return new GoogleFont('Noto Sans', {
      name: 'sans serif',
      weight: 400,
      style: 'normal',
    });
  }
});
*/
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
} from './core';
