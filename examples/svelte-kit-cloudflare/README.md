# SvelteKit + Cloudflare adapter example

Demonstration of using `cf-wasm` packages (like `@cf-wasm/og`) in a SvelteKit project deployed via Cloudflare Workers using `@sveltejs/adapter-cloudflare`.

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

## Install cf-wasm packages you want to use

Lets say you want to use `@cf-wasm/og`, install it:

```shell
pnpm install @cf-wasm/og
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
