# @cf-wasm/satori

Enlightened library to convert HTML and CSS to SVG.

Powered by [satori](https://github.com/vercel/satori).

## Installation

```shell
npm install @cf-wasm/satori       # npm
yarn add @cf-wasm/satori          # yarn
pnpm add @cf-wasm/satori          # pnpm
```

## Usage

- Cloudflare Workers / Pages (Wrangler):

  ```ts
  import { satori } from "@cf-wasm/satori/workerd";
  ```

- Next.js Edge Runtime:

  ```ts
  import { satori } from "@cf-wasm/satori/edge-light";
  ```

- Node.js (file base):

  ```ts
  import { satori } from "@cf-wasm/satori/node";
  ```

## Documentation

Read official documentation at [satori](https://github.com/vercel/satori).
