import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/*.ts', 'src/polyfills/*.ts'],
  format: ['esm', 'cjs'],
  platform: 'neutral',
  outDir: 'dist',
  sourcemap: true,
  splitting: true,
  shims: true,
  clean: true,
  dts: true,
});
