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

Because `package.json` includes conditional exports for `node`, `workerd`, and `edge-light`, you can usually import directly from `@cf-wasm/minify-html` and let the runtime choose the correct entrypoint:

```ts
import { minify } from "@cf-wasm/minify-html";
```

If you want to be explicit, import from a submodule instead:

- Cloudflare Workers / Pages (Wrangler):

  ```ts
  import { minify } from "@cf-wasm/minify-html/workerd";
  ```

- Next.js Edge Runtime:

  ```ts
  import { minify } from "@cf-wasm/minify-html/edge-light";
  ```

- Node.js (inline):

  ```ts
  import { minify } from "@cf-wasm/minify-html/node";
  ```

- Browser, Web Worker, etc. (experimental)

  ```ts
  import { minify } from "@cf-wasm/minify-html/others";
  ```
