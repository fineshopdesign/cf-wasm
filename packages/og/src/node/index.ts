import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import * as resvg from '@cf-wasm/resvg/2.4.1/node';
import * as satori from '@cf-wasm/satori/node';
import { defaultFont, modules } from '../core';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const fallbackFont = fs.readFileSync(path.resolve(dirname, '../core/noto-sans-v27-latin-regular.ttf.bin'));

// Set modules
modules.set(resvg, satori);

// Set default font
defaultFont.set(fallbackFont);

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
