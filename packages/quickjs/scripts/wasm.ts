import fs from 'node:fs';
import path from 'node:path';

const VARIANTS = ['DEBUG_SYNC', 'RELEASE_SYNC'];
const OUT_DIR = './src/core';

for (const variant of VARIANTS) {
  const wasmModulePath = new URL(import.meta.resolve(`@jitl/quickjs-wasmfile-${variant.toLowerCase().replace(/_/g, '-')}/wasm`)).pathname;
  const wasmModuleSourceMapPath = `${wasmModulePath}.map`;

  fs.copyFileSync(wasmModulePath, path.join(OUT_DIR, `${variant}.wasm`));

  if (fs.existsSync(wasmModuleSourceMapPath)) {
    fs.copyFileSync(wasmModuleSourceMapPath, path.join(OUT_DIR, `${variant}.wasm.map.txt`));
  }
}
