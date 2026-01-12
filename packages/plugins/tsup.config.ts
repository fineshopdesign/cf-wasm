import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/*.ts'],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  outDir: 'dist',
  sourcemap: true,
  splitting: true,
  bundle: true,
  skipNodeModulesBundle: true,
  shims: true,
  dts: true,
  clean: true,
});
