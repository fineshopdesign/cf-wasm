# @cf-wasm/resvg

A high-performance SVG renderer and toolkit, powered by Rust based resvg.

Powered by [@resvg/resvg-wasm](https://github.com/thx/resvg-js/tree/main/wasm).

## Installation

```shell
npm install @cf-wasm/resvg       # npm
yarn add @cf-wasm/resvg          # yarn
pnpm add @cf-wasm/resvg          # pnpm
```

## Usage

- Cloudflare Workers / Pages (Wrangler):

  ```ts
  import { Resvg } from "@cf-wasm/resvg/workerd";
  // To use v2.4.1 of @resvg/resvg-wasm, use the below instead
  import { Resvg } from "@cf-wasm/resvg/legacy/workerd";
  ```

- Next.js Edge Runtime:

  ```ts
  import { Resvg } from "@cf-wasm/resvg/edge-light";
  // To use v2.4.1 of @resvg/resvg-wasm, use the below instead
  import { Resvg } from "@cf-wasm/resvg/legacy/edge-light";
  ```

- Node.js (file base):

  ```ts
  import { Resvg } from "@cf-wasm/resvg/node";
  // To use v2.4.1 of @resvg/resvg-wasm, use the below instead
  import { Resvg } from "@cf-wasm/resvg/legacy/node";
  ```

## Documentation

It is recommended to use `Resvg.async()` async static method instead of `new Resvg()` constructor:

```tsx
import { Resvg } from "@cf-wasm/resvg/legacy/node";

// this is recommended
await Resvg.async("<svg...</svg>");

// instead of
new Resvg("<svg...</svg>");
```

For API reference, read official documentation at [@resvg/resvg-wasm](https://github.com/thx/resvg-js/tree/main/wasm).
