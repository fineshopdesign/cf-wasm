import fs from 'node:fs';
import path from 'node:path';
import * as glob from 'glob';
import { defineConfig } from 'tsup';

const RESVG_WASM_LOCATION = new URL(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm')).pathname;
const RESVG_WASM_DESTINATION = 'src/core/resvg.wasm';

const RESVG_WASM_LOCATION_LEGACY = new URL(import.meta.resolve('@resvg/resvg-wasm-legacy/index_bg.wasm')).pathname;
const RESVG_WASM_DESTINATION_LEGACY = 'src/legacy/core/resvg.wasm';

export default defineConfig(() => {
  fs.copyFileSync(RESVG_WASM_LOCATION, RESVG_WASM_DESTINATION);
  fs.copyFileSync(RESVG_WASM_LOCATION_LEGACY, RESVG_WASM_DESTINATION_LEGACY);

  return [
    {
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
      outDir: 'dist',
      external: [/\.wasm$/, /\.wasm\?module$/, /\.bin$/],
      sourcemap: true,
      shims: true,
      clean: true,
      dts: true,
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
      entry: ['src/node.ts', 'src/others.ts', 'src/legacy/node.ts', 'src/legacy/others.ts'],
      format: ['cjs'],
      outDir: 'dist',
      sourcemap: true,
      shims: true,
      clean: true,
      dts: true,
    },
  ];
});
