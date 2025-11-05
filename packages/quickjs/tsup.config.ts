import fs from 'node:fs';
import path from 'node:path';
import * as glob from 'glob';
import { defineConfig } from 'tsup';

const VARIANTS = ['DEBUG_SYNC', 'RELEASE_SYNC'];
const CORE_DIR = './src/core';

export default defineConfig(() => {
  for (const variant of VARIANTS) {
    const wasmModulePath = new URL(import.meta.resolve(`@jitl/quickjs-wasmfile-${variant.toLowerCase().replace(/_/g, '-')}/wasm`)).pathname;
    const wasmModuleSourceMapPath = `${wasmModulePath}.map`;
    fs.copyFileSync(wasmModulePath, path.join(CORE_DIR, `${variant}.wasm`));
    if (fs.existsSync(wasmModuleSourceMapPath)) {
      fs.copyFileSync(wasmModuleSourceMapPath, path.join(CORE_DIR, `${variant}.wasm.map.txt`));
    }
  }

  return [
    {
      entry: ['src/next.ts', 'src/next-debug.ts', 'src/node.ts', 'src/node-debug.ts', 'src/workerd.ts', 'src/workerd-debug.ts'],
      format: ['esm'],
      outDir: 'dist',
      external: [/\.wasm$/, /\.wasm\?module$/, /\.bin$/, /\.txt$/],
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
      entry: ['src/node.ts', 'src/node-debug.ts'],
      format: ['cjs'],
      outDir: 'dist',
      sourcemap: true,
      shims: true,
      clean: true,
      dts: true,
    },
  ];
});
