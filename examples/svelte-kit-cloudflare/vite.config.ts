import cloudflareModules from '@cf-wasm/plugins/vite-cloudflare-modules';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import devtoolsJson from 'vite-plugin-devtools-json';

export default defineConfig({
  ssr: {
    noExternal: [/^@cf-wasm\/.*/],
  },
  plugins: [sveltekit(), devtoolsJson(), cloudflareModules()],
});
