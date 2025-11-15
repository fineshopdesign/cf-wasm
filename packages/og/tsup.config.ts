import fs from 'node:fs';
import path from 'node:path';
import * as glob from 'glob';
import { defineConfig, type Options } from 'tsup';

const commonOptions = {
  outDir: 'dist',
  platform: 'neutral',
  sourcemap: true,
  splitting: true,
  shims: true,
  dts: true,
} satisfies Options;

export default defineConfig([
  {
    ...commonOptions,
    entry: ['src/next.ts', 'src/node.ts', 'src/others.ts', 'src/workerd.ts', 'src/figma.ts', 'src/html-to-react.ts'],
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
    entry: ['src/node.ts', 'src/others.ts', 'src/figma.ts', 'src/html-to-react.ts'],
    format: ['cjs'],
  },
]);
