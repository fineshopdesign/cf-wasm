import './resvg';
import './satori';

import notoSansFontBuffer from '@cf-wasm/og/noto-sans-v27-latin-regular.ttf.bin';
import { defaultFont } from '@cf-wasm/og/others';

defaultFont.set(notoSansFontBuffer);

export * from '@cf-wasm/og/others';
