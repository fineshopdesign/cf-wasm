import * as resvg from '@cf-wasm/resvg/2.4.1/others';
import * as satori from '@cf-wasm/satori/others';
import { GoogleFont, defaultFont, modules } from '../core';

// Set modules
modules.resvg = resvg;
modules.satori = satori;

// Set default font
defaultFont.set(
  new GoogleFont('Noto Sans', {
    name: 'sans serif',
    weight: 400,
    style: 'normal',
  }),
);

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
