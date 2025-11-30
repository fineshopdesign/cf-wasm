# SvelteKit + Cloudflare adapter example

Demonstration of using `@cf-wasm/*` packages (e.g. `@cf-wasm/og`) in a SvelteKit project deployed via Cloudflare Workers using `@sveltejs/adapter-cloudflare`.

> [!TIP]
> The same setup works when deploying to Vercel Edge using `@sveltejs/adapter-vercel` with `runtime: 'edge'`.

## Creating a project

Create a new [SvelteKit + Cloudflare](https://developers.cloudflare.com/workers/framework-guides/web-apps/svelte/) app:

```shell
pnpm create cloudflare@latest my-svelte-app --framework=svelte
```

After generation:

```shell
cd my-svelte-app
pnpm install
```

## Update your `vite.config.ts`

We must:

- Ensure Vite externalizes `@cf-wasm/*` modules during SSR bundling.

```ts
// vite.config.ts
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit()],
  ssr: {
    external: [
      "@cf-wasm/og",
      "@cf-wasm/resvg",
      "@cf-wasm/satori",
      "@cf-wasm/photon",
    ],
  },
});
```

> [!TIP]
> Externalizing packages makes sure Vite does not bundle those dependencies in your final server build, and instead loads them at runtime.  
> This allows the dev server to pick the `node` conditional export during local development and prerendering, while `wrangler` can pick the `workerd` conditional export during `wrangler dev` and `wrangler deploy`.
>
> You can use [another method](./NO_EXTERNAL.md) if you wish to bundle packages in your final server build.

## Install `@cf-wasm/*` packages you want to use

Lets say you want to use `@cf-wasm/og`, install it:

```shell
pnpm install @cf-wasm/og
```

> [!NOTE]
> Ensure that it is included in `ssr.external` in Vite config.

## Create an API route

Create an API route and use the package:

```ts
// src/routes/og/+server.ts
import { ImageResponse } from "@cf-wasm/og";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
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
