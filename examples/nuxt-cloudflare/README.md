# Nuxt + Cloudflare preset example

Demonstration of using `cf-wasm` packages (like `@cf-wasm/og`) in a Nuxt project deployed via Cloudflare Workers using preset `cloudflare_module`.

## Creating a project

Create a new [Nuxt + Cloudflare](https://developers.cloudflare.com/workers/framework-guides/web-apps/more-web-frameworks/nuxt/) app:

```shell
pnpm create cloudflare@latest my-nuxt-app --framework=nuxt
```

After generation:

```shell
cd my-nuxt-app
pnpm install
```

## Install cf-wasm packages you want to use

Lets say you want to use `@cf-wasm/og`, install it:

```shell
pnpm install @cf-wasm/og
```

## Update your `nuxt.config.ts`

We must:

- Ensure Nitro externalizes `@cf-wasm/*` modules in server bundling.

```ts
// nuxt.config.ts

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  nitro: {
    preset: "cloudflare_module",

    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
    },

    rollupConfig: {
      external: [/^@cf-wasm\/.*/],
    },
  },

  modules: ["nitro-cloudflare-dev"],
});
```

## Create an API route

Create an API route and use the package:

```ts
// server/routes/og.ts
import { ImageResponse } from "@cf-wasm/og";

export default defineEventHandler(async () => {
  // satori can only render react node out-of-the-box
  return await ImageResponse.async({
    key: "0",
    type: "div",
    props: {
      style: {
        display: "flex",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(253, 243, 255, 1)",
        color: "rgba(10, 10, 12, 1)",
        fontSize: "40px",
      },
      children: ["Hello World!"],
    },
  });
});
```
