import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as glob from 'glob';
import { defineConfig, type Options } from 'tsup';

const YOGA_WASM_LOCATION = fileURLToPath(import.meta.resolve('yoga-wasm-web/dist/yoga.wasm'));
const YOGA_WASM_DESTINATION = 'src/lib/yoga.wasm';

export default defineConfig(() => {
  fs.copyFileSync(YOGA_WASM_LOCATION, YOGA_WASM_DESTINATION);

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
      entry: ['src/next.ts', 'src/node.ts', 'src/others.ts', 'src/workerd.ts'],
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
      entry: ['src/node.ts', 'src/others.ts'],
      format: ['cjs'],
    },
  ];
});
