# @cf-wasm/plugins

Plugins to make Cloudflare-compatible packages work seamlessly with modern build tools such as Vite.

## Cloudflare Modules Vite

The Vite plugin exported from the `@cf-wasm/plugins/vite-additional-modules` submodule enables proper resolution of ESM-style imports that are natively supported on Cloudflare Workers, such as:

- `.wasm?module`
- `.wasm`
- `.txt`
- `.bin`

These import types typically fail in standard development environments since they rely on Cloudflare’s module loader behavior. This plugin bridges that gap by emulating Cloudflare’s module import system during development and build time.

## Why You Need It

When using frameworks or adapters that target Cloudflare Workers (for example, `@sveltejs/adapter-cloudflare` in a SvelteKit app), you might encounter build-time errors like:

```
error during build:
[vite:wasm-fallback] Could not load /home/user/svelte-kit-app/src/lib/resvg.wasm (imported by src/routes/resvg/+server.ts): "ESM integration proposal for Wasm" is not supported currently. Use vite-plugin-wasm or other community plugins to handle this. Alternatively, you can use `.wasm?init` or `.wasm?url`. See https://vite.dev/guide/features.html#webassembly for more details.
```

This happens because Vite (and most bundlers) do not natively understand Cloudflare’s special module query syntax.

The `vite-additional-modules` plugin solves this problem by teaching Vite how to handle these imports.

## Installation

```shell
npm install @cf-wasm/plugins --save-dev
```

## Usage

Add the plugin to your `vite.config.js` (or `vite.config.ts`):

```ts
// vite.config.{ts|js}
import additionalModules from "@cf-wasm/plugins/vite-additional-modules";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [additionalModules()],
});
```

> [!NOTE]
> If a dependency is using Cloudflare supported ESM imports syntax (for example, `@cf-wasm/satori`), you need to ensure Vite does not externalize `@cf-wasm/satori` modules during SSR bundling:
>
> ```ts
> // vite.config.{ts|js}
> import additionalModules from "@cf-wasm/plugins/vite-additional-modules";
> import { defineConfig } from "vite";
>
> export default defineConfig({
>   plugins: [additionalModules()],
>   ssr: {
>     noExternal: [/^@cf-wasm\/.*/],
>   },
> });
> ```

### Example: SvelteKit + Cloudflare Adapter

If you are using `@sveltejs/adapter-cloudflare`, simply include this plugin in your Vite configuration:

```ts
// vite.config.{ts|js}
import additionalModules from "@cf-wasm/plugins/vite-additional-modules";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [sveltekit(), additionalModules()],
});
```

```js
// svelte.config.js
import adapter from "@sveltejs/adapter-cloudflare";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter(),
  },
};

export default config;
```

Now, you can safely use imports like:

```ts
// src/routes/api/+server.ts
import wasmModule from "$/lib/my-module.wasm?module";
import textData from "$/lib/my-schema.txt";

export async function GET() {
  //...
}
```

These will work correctly both in `development` and when deployed to `Cloudflare Workers`.

## Supported Extensions

| Extension      | Description         | Output Type          |
| -------------- | ------------------- | -------------------- |
| `.wasm?module` | WebAssembly modules | `WebAssembly.Module` |
| `.wasm`        | WebAssembly modules | `WebAssembly.Module` |
| `.txt`         | Plain text files    | `string`             |
| `.bin`         | Binary files        | `ArrayBuffer`        |

## How It Works

- In `development`, the plugin intercepts Vite’s module resolution and simulates Cloudflare’s import behavior, compiling or serving the file as needed.
- In `production builds`, the plugin ensures that these files are emitted correctly and referenced as standard ESM imports compatible with the Cloudflare's workerd runtime.
