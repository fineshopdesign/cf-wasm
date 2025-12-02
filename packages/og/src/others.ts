import * as resvg from '@cf-wasm/resvg/legacy/others';
import * as satori from '@cf-wasm/satori/others';
import { defaultFont, GoogleFont } from './core';
import { modules } from './core/modules';

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

export * from './core';
