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
  ```

- Next.js Edge Runtime:

  ```ts
  import { Resvg } from "@cf-wasm/resvg/next";
  ```

- Node.js (file base):

  ```ts
  import { Resvg } from "@cf-wasm/resvg/node";
  ```

## Documentation

Read official documentation at [@resvg/resvg-wasm](https://github.com/thx/resvg-js/tree/main/wasm).
