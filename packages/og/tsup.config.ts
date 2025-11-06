import fs from 'node:fs';
import path from 'node:path';
import * as glob from 'glob';
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/next.ts', 'src/node.ts', 'src/others.ts', 'src/workerd.ts', 'src/figma.ts', 'src/html-to-react.ts'],
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
    entry: ['src/node.ts', 'src/others.ts', 'src/figma.ts', 'src/html-to-react.ts'],
    format: ['cjs'],
    outDir: 'dist',
    sourcemap: true,
    shims: true,
    dts: true,
  },
]);
