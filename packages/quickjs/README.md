# @cf-wasm/quickjs

QuickJS for Cloudflare workers.  

Powered by [quickjs-emscripten](https://www.npmjs.com/package/quickjs-emscripten)

> [!WARNING]
> This package is in development. Breaking changes may be introduced without following semantic versioning.

## Installation

```shell
npm install @cf-wasm/quickjs       # npm
yarn add @cf-wasm/quickjs          # yarn
pnpm add @cf-wasm/quickjs          # pnpm
```

## Usage

- Cloudflare workers:  
  `import * as photon from "@cf-wasm/quickjs";`

## Examples

```ts
import {
  getQuickJSWASMModule,
  shouldInterruptAfterDeadline
} from "@cf-wasm/quickjs";

export default {
  async fetch() {
    const QuickJS = await getQuickJSWASMModule();

    const result = QuickJS.evalCode("({ multiplication: 50 * 6, random: Math.random() })", {
      shouldInterrupt: shouldInterruptAfterDeadline(Date.now() + 1000),
      memoryLimitBytes: 1024 * 1024
    });

    return Response.json({ result });
  }
} satisfies ExportedHandler;
```
