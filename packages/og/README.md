# @cf-wasm/og

Generate Open Graph Images dynamically from HTML/CSS without a browser.  
Powered by [@vercel/og](https://www.npmjs.com/package/@vercel/og).

## Installation

Install the package by running the following command in terminal:

```shell
npm install @cf-wasm/og
```

## Usage

- Cloudflare workers:  
  `import * as og from "@cf-wasm/og";`
- Next.js (Webpack):  
  `import * as og from "@cf-wasm/og/next";`
- CJS (file base):  
  `import * as og from "@cf-wasm/og/node";`

### Examples

Here are some examples for using this library.

### Cloudflare Workers

If you are using Cloudflare Workers, you can use it as shown below:

```ts
// src/index.tsx
import React from "react";
import { ImageResponse, GoogleFont, cache, defaultFont } from "@cf-wasm/og";

export type Env = Readonly<{}>;

const worker: ExportedHandler<Env> = {
  async fetch(request, env, ctx) {
    // Make sure to overwrite the cache.waitUntil function
    cache.waitUntil = ctx.waitUntil.bind(ctx);

    // Sets default font to `Inter` from Google Fonts
    // defaultFont.set(
    //   new GoogleFont("Inter")
    // );

    const { searchParams } = new URL(request.url);
    const parameters = Object.fromEntries(searchParams.entries());

    const response = new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#6f90ab",
            fontSize: "2rem",
            color: "#fff"
          }}
        >
          <span>Noto Sans (Default Font)</span>
          <span
            style={{
              fontFamily: "JetBrains Mono"
            }}
          >
            JetBrains Mono (using GoogleFont class)
          </span>
          <span>These are emojis: 😎🌩️</span>
          <span
            style={{
              fontFamily: "JetBrains Mono"
            }}
          >
            Parameters: {JSON.stringify(parameters)}
          </span>
        </div>
      ),
      {
        fonts: [new GoogleFont("JetBrains Mono")],
        emoji: "fluent"
      }
    );

    return response;
  }
};

export default worker;
```

Notes: If you are using `@cf-wasm/og` on `Cloudflare Workers`, you may hit the [CPU time limit](https://developers.cloudflare.com/workers/platform/limits/#cpu-time) as well as the 1MiB script size limit (Workers Free Plan). Even when using the original project `@vercel/og` on `Cloudflare Pages`, you hit the CPU time limit.
