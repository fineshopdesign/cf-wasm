import * as resvg from '@cf-wasm/resvg/legacy/edge-light';
import * as satori from '@cf-wasm/satori/edge-light';
import { defaultFont } from './core';
import { modules } from './core/modules';
import notoSansFontBuffer from './lib/noto-sans-v27-latin-regular.ttf.bin.inline';

// Set modules
modules.set(resvg, satori);

// Set default font
defaultFont.set(notoSansFontBuffer);

export * from './core';
