import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    external: ['@cf-wasm/og', '@cf-wasm/resvg', '@cf-wasm/satori', '@cf-wasm/photon'],
  },
});
