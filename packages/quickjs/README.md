# @cf-wasm/quickjs

A high-performance, secure, extensible JavaScript runtime.

Powered by [quickjs-emscripten](https://github.com/justjake/quickjs-emscripten)

> [!WARNING]
> This package is in development. Breaking changes may be introduced without following semantic versioning.

## Installation

```shell
npm install @cf-wasm/quickjs       # npm
yarn add @cf-wasm/quickjs          # yarn
pnpm add @cf-wasm/quickjs          # pnpm
```

## Usage

Because `package.json` includes conditional exports for `node`, `workerd`, and `edge-light`, you can usually import directly from `@cf-wasm/quickjs` and let the runtime choose the correct entrypoint:

```ts
import { getQuickJSWASMModule } from "@cf-wasm/quickjs";
```

If you want to be explicit, import from a submodule instead:

- Cloudflare Workers / Pages (Wrangler):

  ```ts
  import { getQuickJSWASMModule } from "@cf-wasm/quickjs/workerd";
  ```

- Next.js Edge Runtime:

  ```ts
  import { getQuickJSWASMModule } from "@cf-wasm/quickjs/edge-light";
  ```

- Node.js (inline):

  ```ts
  import { getQuickJSWASMModule } from "@cf-wasm/quickjs/node";
  ```

## Examples

Here are some examples for using this library.

### Cloudflare Workers

If you are using Cloudflare Workers, you can use it as shown below:

```ts
import {
  getQuickJSWASMModule,
  shouldInterruptAfterDeadline,
} from "@cf-wasm/quickjs";

export default {
  async fetch() {
    const QuickJS = await getQuickJSWASMModule();

    const result = QuickJS.evalCode(
      "({ multiplication: 50 * 6, random: Math.random() })",
      {
        shouldInterrupt: shouldInterruptAfterDeadline(Date.now() + 1000),
        memoryLimitBytes: 1024 * 1024,
      },
    );

    return Response.json({ result });
  },
} satisfies ExportedHandler;
```
