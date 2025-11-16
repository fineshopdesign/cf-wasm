# @cf-wasm/minify-html

Extremely fast and smart HTML + JS + CSS minifier.

Powered by [@wilsonzlin/minify-html](https://github.com/wilsonzlin/minify-html)

## Installation

```shell
npm install @cf-wasm/minify-html       # npm
yarn add @cf-wasm/minify-html          # yarn
pnpm add @cf-wasm/minify-html          # pnpm
```

## Usage

- Cloudflare Workers / Pages (Wrangler):

  ```ts
  import { minify } from "@cf-wasm/minify-html/workerd";
  ```

- Next.js Edge Runtime:

  ```ts
  import { minify } from "@cf-wasm/minify-html/next";
  ```

- Node.js (file base):

  ```ts
  import { minify } from "@cf-wasm/minify-html/node";
  ```

- Browser, Web Worker, etc. (experimental)

  ```ts
  import { minify } from "@cf-wasm/minify-html/others";
  ```
