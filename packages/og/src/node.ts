import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import * as resvg from '@cf-wasm/resvg/legacy/node';
import * as satori from '@cf-wasm/satori/node';
import { defaultFont } from './core';
import { modules } from './core/modules';

const filename = url.fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const notoSansFontBuffer = fs.readFileSync(path.resolve(dirname, './lib/noto-sans-v27-latin-regular.ttf.bin')).buffer;

// Set modules
modules.set(resvg, satori);

// Set default font
defaultFont.set(notoSansFontBuffer);

export * from './core';
