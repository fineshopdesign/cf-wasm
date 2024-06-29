# @cf-wasm/resvg

A high-performance SVG renderer and toolkit, powered by Rust based resvg.  

Powered by [@resvg/resvg-wasm](https://www.npmjs.com/package/@resvg/resvg-wasm).

## Installation

```shell
npm install @cf-wasm/resvg       # npm
yarn add @cf-wasm/resvg          # yarn
pnpm add @cf-wasm/resvg          # pnpm
```

## Usage

- Cloudflare Workers / Pages (Esbuild):

  ```ts
  import { Resvg } from "@cf-wasm/resvg";
  ```

- Next.js Edge Runtime (Webpack):

  ```ts
  import { Resvg } from "@cf-wasm/resvg/next";
  ```

- Node.js (file base):

  ```ts
  import { Resvg } from "@cf-wasm/resvg/node";
  ```

## Documentation

Read official documentation at [@resvg/resvg-wasm](https://www.npmjs.com/package/@resvg/resvg-wasm).
