# Astro + Cloudflare adapter example

Demonstration of using `@cf-wasm/*` packages (e.g. `@cf-wasm/og`) in a Astro project deployed via Cloudflare Workers using `@astrojs/cloudflare`.

## Creating a project

Create a new [Astro + Cloudflare](https://developers.cloudflare.com/workers/framework-guides/web-apps/astro/) app:

```shell
pnpm create cloudflare@latest my-astro-app --framework=astro
```

After generation:

```shell
cd my-astro-app
pnpm install
```

## Update your `astro.config.{mjs|ts}`

We must:

- Ensure Vite does not externalize `@cf-wasm/*` modules during SSR bundling.

```ts
// astro.config.{mjs|ts}
import cloudflare from "@astrojs/cloudflare";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),

  output: "server",

  vite: {
    ssr: {
      noExternal: [/^@cf-wasm\/.*/],
    },
  },
});
```

## Install `@cf-wasm/*` packages you want to use

Lets say you want to use `@cf-wasm/og`, install it:

```shell
pnpm install @cf-wasm/og
```

## Create an API route

Create an API route and use the package:

> [!WARNING]
> You must use the `workerd` submodule of the package:
>
> ```ts
> import { ImageResponse } from "@cf-wasm/og/workerd";
> ```

```ts
// src/pages/og.ts
import { ImageResponse } from "@cf-wasm/og/workerd";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const paramName = url.searchParams.get("name");

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
      children: [`Hello ${paramName || "World"}!`],
    },
  });
};
```
