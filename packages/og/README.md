# @cf-wasm/og

Generate Open Graph Images dynamically from HTML/CSS without a browser.  

Powered by [@vercel/og](https://www.npmjs.com/package/@vercel/og).

> **Warning:** Breaking changes may be introduced without following semantic versioning.  
> Please note that this package may undergo breaking changes between versions without adhering strictly to semantic versioning (SemVer). While efforts will be made to minimize disruptions, it's recommended to review release notes carefully before upgrading to a new version. We apologize for any inconvenience this may cause and appreciate your understanding.

## Installation

```shell
npm install @cf-wasm/og       # npm
yarn add @cf-wasm/og          # yarn
pnpm add @cf-wasm/og          # pnpm
```

## Usage

- Cloudflare workers:  
  `import * as og from "@cf-wasm/og";`
- Next.js (Webpack):  
  `import * as og from "@cf-wasm/og/next";`
- CJS (file base):  
  `import * as og from "@cf-wasm/og/node";`

## Documentation

### Cloudflare Workers/Pages

If you are using Cloudflare Workers/Pages, you must set the execution context as shown:

```tsx
import React from "react";
import { ImageResponse, cache } from "@cf-wasm/og";

const handlers: ExportedHandler = {
  fetch(req, env, ctx) {
    // Set execution context
    cache.setExecutionContext(ctx);

    return new ImageResponse(<>Hello World!</>);
  }
};

export default handlers;
```

### Font Loaders

You can load Google fonts and Custom fonts with ease using `GoogleFont` and `CustomFont` classes respectively:

```tsx
import React from "react";
import { ImageResponse, GoogleFont, CustomFont, cache } from "@cf-wasm/og";

const handlers: ExportedHandler = {
  fetch(req, env, ctx) {
    cache.setExecutionContext(ctx);

    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%"
          }}
        >
          <p>Text with Default font</p>
          <p style={{ fontFamily: "Inclusive Sans" }}>Text with Google font</p>
          <p style={{ fontFamily: "JetBrains Mono" }}>Text with Custom font</p>
        </div>
      ),
      {
        fonts: [
          // Using Google font loader
          new GoogleFont("Inclusive Sans"),
          // Using Custom font loader
          new CustomFont("JetBrains Mono", () =>
            fetch(
              "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf"
            ).then((res) => res.arrayBuffer())
          )
        ]
      }
    );
  }
};

export default handlers;
```

### Default font

You can set global default font using `GoogleFont` or `CustomFont` classes:

```tsx
import React from "react";
import {
  ImageResponse,
  CustomFont,
  GoogleFont,
  defaultFont,
  cache
} from "@cf-wasm/og";

// By using Google font loader
defaultFont.set(new GoogleFont("Merriweather"));

// or
// By using Custom font loader
defaultFont.set(
  new CustomFont("JetBrains Mono", () =>
    fetch(
      "https://github.com/JetBrains/JetBrainsMono/raw/master/fonts/ttf/JetBrainsMono-Regular.ttf"
    ).then((res) => res.arrayBuffer())
  )
);

const handlers: ExportedHandler = {
  fetch(req, env, ctx) {
    cache.setExecutionContext(ctx);

    // It should render with JetBrains Mono font
    return new ImageResponse(<>Hello World!</>);
  }
};

export default handlers;
```

You can set default font using `defaultFont` option:

```tsx
import React from "react";
import { ImageResponse, GoogleFont, cache } from "@cf-wasm/og";

const handlers: ExportedHandler = {
  fetch(req, env, ctx) {
    cache.setExecutionContext(ctx);

    return new ImageResponse(<>Hello World!</>, {
      // Set default font
      defaultFont: new GoogleFont("Merriweather")
    });
  }
};

export default handlers;
```

### SVG format

By default `ImageResponse` renders to `PNG` but you can use `format` option to render to `SVG`:

```tsx
import React from "react";
import { ImageResponse, cache } from "@cf-wasm/og";

const handlers: ExportedHandler = {
  fetch(req, env, ctx) {
    cache.setExecutionContext(ctx);

    return new ImageResponse(<>Hello World!</>, {
      // Set format
      format: "svg"
    });
  }
};

export default handlers;
```

### Render HTML

The `@cf-wasm/og/html-to-react` submodule provides a function `t` which can be used to transform html to `ReactElement` making it possible to render html as well:

```tsx
import { ImageResponse, cache } from "@cf-wasm/og";
import { t } from "@cf-wasm/og/html-to-react";

const handlers: ExportedHandler = {
  fetch(req, env, ctx) {
    cache.setExecutionContext(ctx);

    const html = `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
        <p>Renders HTML</p>
        <p>Hello World!</p>
      </div>`;

    return new ImageResponse(t(html));
  }
};

export default handlers;
```

### `render` function

You can also use `render` function instead of `ImageResponse` to catch errors or for other use cases:

```tsx
import React from "react";
import { render, cache } from "@cf-wasm/og";

const handlers: ExportedHandler = {
  async fetch(req, env, ctx) {
    cache.setExecutionContext(ctx);

    try {
      const { image } = await render(<>Hello World!</>).asPng();

      return new Response(image, {
        headers: {
          "Content-Type": "image/png"
        }
      });
    } catch {
      return new Response("Not found", {
        status: 404
      });
    }
  }
};

export default handlers;
```

## Examples

Following are some examples for using this library:

### Cloudflare Workers

If you are using Cloudflare Workers, you can use it as shown below:

```tsx
// src/index.tsx
import React from "react";
import { ImageResponse, GoogleFont, cache } from "@cf-wasm/og";

const handlers: ExportedHandler = {
  async fetch(req, env, ctx) {
    // Make sure to set the execution context
    cache.setExecutionContext(ctx);

    const { searchParams } = new URL(req.url);
    const parameters = Object.fromEntries(searchParams.entries());

    return new ImageResponse(
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
  }
};

export default handlers;
```

> **Warning**: If you are using `@cf-wasm/og` on `Cloudflare Workers`, you may hit the [CPU time limit](https://developers.cloudflare.com/workers/platform/limits/#cpu-time) as well as the 1MiB script size limit (Workers Free Plan). Even when using the original project `@vercel/og` on `Cloudflare Pages`, you hit the CPU time limit.

### Next.js (App Router)

If you are using Next.js (App router) with edge runtime, you can use it as shown below:

```tsx
// (src/)app/api/og/route.tsx
import React from "react";
import { type NextRequest } from "next/server";
import { ImageResponse, GoogleFont } from "@cf-wasm/og/next";

export const runtime = "edge";

export function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const parameters = Object.fromEntries(searchParams.entries());

  return new ImageResponse(
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
}
```

### Next.js (Pages Router)

If you are using Next.js (Pages router) with edge runtime, you can use it as shown below:

```tsx
// (src/)pages/api/og.tsx
import React from "react";
import { type NextRequest } from "next/server";
import { ImageResponse, GoogleFont } from "@cf-wasm/og/next";

export const config = {
  runtime: "edge"
};

export default async function handler(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const parameters = Object.fromEntries(searchParams.entries());

  return new ImageResponse(
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
}
```
