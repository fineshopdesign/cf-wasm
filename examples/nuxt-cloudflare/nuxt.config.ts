import additionalModules from '@cf-wasm/plugins/nitro-additional-modules';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  nitro: {
    preset: 'cloudflare_module',

    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },

    modules: [additionalModules({ target: 'edge-light' })],
  },

  modules: ['nitro-cloudflare-dev'],
});
