import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
  plugins: [sveltekit(), devtoolsJson()],
  ssr: {
    external: ['@cf-wasm/og', '@cf-wasm/resvg', '@cf-wasm/satori', '@cf-wasm/photon'],
  },
});
