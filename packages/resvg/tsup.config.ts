import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as glob from 'glob';
import { defineConfig, type Options } from 'tsup';

const RESVG_WASM_LOCATION = fileURLToPath(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm'));
const RESVG_WASM_DESTINATION = 'src/lib/resvg.wasm';

const RESVG_WASM_LOCATION_LEGACY = fileURLToPath(import.meta.resolve('@resvg/resvg-wasm-legacy/index_bg.wasm'));
const RESVG_WASM_DESTINATION_LEGACY = 'src/legacy/lib/resvg.wasm';

export default defineConfig(() => {
  fs.copyFileSync(RESVG_WASM_LOCATION, RESVG_WASM_DESTINATION);
  fs.copyFileSync(RESVG_WASM_LOCATION_LEGACY, RESVG_WASM_DESTINATION_LEGACY);

  const commonOptions = {
    outDir: 'dist',
    platform: 'neutral',
    sourcemap: true,
    splitting: true,
    shims: true,
    dts: true,
  } satisfies Options;

  return [
    {
      ...commonOptions,
      entry: [
        'src/next.ts',
        'src/node.ts',
        'src/others.ts',
        'src/workerd.ts',
        'src/legacy/next.ts',
        'src/legacy/node.ts',
        'src/legacy/others.ts',
        'src/legacy/workerd.ts',
      ],
      format: ['esm'],
      external: [/\.wasm$/, /\.wasm\?module$/, /\.bin$/],
      clean: true,
      async onSuccess() {
        // Copy assets
        const assets = glob.sync('src/**/*.{wasm,bin}');
        for (const file of assets) {
          const destination = path.join('dist', file.replace(/^src[\\/]/, ''));
          const dir = path.dirname(destination);
          if (fs.existsSync(destination)) {
            continue;
          }
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.copyFileSync(file, destination);
        }
      },
    },
    {
      ...commonOptions,
      entry: ['src/node.ts', 'src/others.ts', 'src/legacy/node.ts', 'src/legacy/others.ts'],
      format: ['cjs'],
    },
  ];
});
