import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/*.ts', 'src/polyfills/*.ts'],
  format: ['esm', 'cjs'],
  outDir: 'dist',
  sourcemap: true,
  shims: true,
  clean: true,
  dts: true,
});
