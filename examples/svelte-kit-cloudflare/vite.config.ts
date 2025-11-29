import additionalModules from '@cf-wasm/plugins/vite-additional-modules';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit(), additionalModules({ target: 'edge-light' })],
  ssr: {
    noExternal: [/@cf-wasm\/.*/],
  },
});
