# Nuxt + Cloudflare preset example

Demonstration of using `@cf-wasm/*` packages (e.g. `@cf-wasm/og`) in a Nuxt project deployed via Cloudflare Workers using preset `cloudflare_module`.

> [!TIP]
> The same setup works when deploying to Vercel Edge using preset `vercel_edge`.

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

## Install `@cf-wasm/plugins`

The `nitro-additional-modules` Nitro module tells Rollup how to handle WebAssembly modules used by cf-wasm packages.

```shell
pnpm install -D @cf-wasm/plugins
```

## Update your `nuxt.config.ts`

We must:

- Load the `nitro-additional-modules` Nitro module.

```ts
// nuxt.config.ts
import additionalModules from "@cf-wasm/plugins/nitro-additional-modules";

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

    modules: [additionalModules({ target: "edge-light" })],
  },

  modules: ["nitro-cloudflare-dev"],
});
```

## Install `@cf-wasm/*` packages you want to use

Lets say you want to use `@cf-wasm/og`, install it:

```shell
pnpm install @cf-wasm/og
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
