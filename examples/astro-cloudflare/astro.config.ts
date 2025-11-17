import cloudflare from '@astrojs/cloudflare';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),

  output: 'server',

  vite: {
    ssr: {
      noExternal: [/^@cf-wasm\/.*/],
    },
  },
});
