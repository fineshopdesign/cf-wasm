import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as glob from 'glob';
import { defineConfig, type Options } from 'tsup';

const LIB_VARIANTS = ['DEBUG_SYNC', 'RELEASE_SYNC'];
const LIB_OUT_DIR = './src/lib';

export default defineConfig(() => {
  for (const variant of LIB_VARIANTS) {
    const wasmModulePath = fileURLToPath(import.meta.resolve(`@jitl/quickjs-wasmfile-${variant.toLowerCase().replace(/_/g, '-')}/wasm`));
    const wasmModuleSourceMapPath = `${wasmModulePath}.map`;
    fs.copyFileSync(wasmModulePath, path.join(LIB_OUT_DIR, `${variant}.wasm`));
    if (fs.existsSync(wasmModuleSourceMapPath)) {
      fs.copyFileSync(wasmModuleSourceMapPath, path.join(LIB_OUT_DIR, `${variant}.wasm.map.txt`));
    }
  }

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
      entry: ['src/next.ts', 'src/next-debug.ts', 'src/node.ts', 'src/node-debug.ts', 'src/workerd.ts', 'src/workerd-debug.ts'],
      format: ['esm'],
      external: [/\.wasm$/, /\.wasm\?module$/, /\.bin$/, /\.txt$/],
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
      entry: ['src/node.ts', 'src/node-debug.ts'],
      format: ['cjs'],
    },
  ];
});
