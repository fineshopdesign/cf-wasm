# @cf-wasm/photon

High-performance Rust image processing library (Photon) for Cloudflare workers, Next.js and Node.js.

Powered by [@silvia-odwyer/photon](https://github.com/silvia-odwyer/photon)  
Built from commit [`1390383`](https://github.com/silvia-odwyer/photon/tree/139038385b0cca7a743a2e5dd451c9e626b6b880)  
Synced with upstream on `2026-07-14 (IST)`.

## Installation

```shell
npm install @cf-wasm/photon       # npm
yarn add @cf-wasm/photon          # yarn
pnpm add @cf-wasm/photon          # pnpm
```

## Usage

Because `package.json` includes conditional exports for `node`, `workerd`, and `edge-light`, you can usually import directly from `@cf-wasm/photon` and let the runtime choose the correct entrypoint:

```ts
import { PhotonImage } from "@cf-wasm/photon";
```

If you want to be explicit, import from a submodule instead:

- Cloudflare Workers / Pages (Wrangler):

  ```ts
  import { PhotonImage } from "@cf-wasm/photon/workerd";
  ```

- Next.js Edge Runtime:

  ```ts
  import { PhotonImage } from "@cf-wasm/photon/edge-light";
  ```

- Node.js (file base):

  ```ts
  import { PhotonImage } from "@cf-wasm/photon/node";
  ```

- Browser, Web Worker, etc. (experimental)

  ```ts
  import { PhotonImage } from "@cf-wasm/photon/others";
  ```

> [!WARNING]
> Cloudflare Workers have strict memory caps (typically `128MB`). To avoid exceeding those limits, validate input image size or reject oversized images before processing.

## Examples

Here are some examples in which image is being resized and converted to webp format:

### Cloudflare Workers

If you are using Cloudflare Workers, you can use it as shown below:

```ts
// src/index.ts
import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon/workerd";

export default {
  async fetch() {
    // url of image to fetch
    const imageUrl = "https://avatars.githubusercontent.com/u/314135";

    // fetch image and get the bytes
    const inputBytes = await fetch(imageUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => new Uint8Array(buffer));

    // create a PhotonImage instance
    const inputImage = PhotonImage.new_from_byteslice(inputBytes);

    // resize image using photon
    const outputImage = resize(
      inputImage,
      inputImage.get_width() * 0.5,
      inputImage.get_height() * 0.5,
      SamplingFilter.Nearest,
    );

    // get webp bytes
    const outputBytes = outputImage.get_bytes_webp();

    // for other formats
    // png  : outputImage.get_bytes();
    // jpeg : outputImage.get_bytes_jpeg(quality);

    // call free() method to free memory
    inputImage.free();
    outputImage.free();

    return new Response(outputBytes, {
      headers: {
        "Content-Type": "image/webp",
      },
    });
  },
} satisfies ExportedHandler;
```

### Next.js (App Router)

If you are using Next.js (App router) with edge runtime, you can use it as shown below:

```ts
// (src/)app/api/image/route.ts
import { type NextRequest } from "next/server";
import {
  PhotonImage,
  SamplingFilter,
  resize,
} from "@cf-wasm/photon/edge-light";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // url of image to fetch
  const imageUrl = "https://avatars.githubusercontent.com/u/314135";

  // fetch image and get the bytes
  const inputBytes = await fetch(imageUrl)
    .then((res) => res.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  // create a PhotonImage instance
  const inputImage = PhotonImage.new_from_byteslice(inputBytes);

  // resize image using photon
  const outputImage = resize(
    inputImage,
    inputImage.get_width() * 0.5,
    inputImage.get_height() * 0.5,
    SamplingFilter.Nearest,
  );

  // get webp bytes
  const outputBytes = outputImage.get_bytes_webp();

  // for other formats
  // png  : outputImage.get_bytes();
  // jpeg : outputImage.get_bytes_jpeg(quality);

  // call free() method to free memory
  inputImage.free();
  outputImage.free();

  return new Response(outputBytes, {
    headers: {
      "Content-Type": "image/webp",
    },
  });
}
```

### Next.js (Pages Router)

If you are using Next.js (Pages router) with edge runtime, you can use it as shown below:

```ts
// (src/)pages/api/image.ts
import { type NextRequest } from "next/server";
import {
  PhotonImage,
  SamplingFilter,
  resize,
} from "@cf-wasm/photon/edge-light";

export const config = {
  runtime: "edge",
  // see https://nextjs.org/docs/messages/edge-dynamic-code-evaluation
  unstable_allowDynamic: ["**/node_modules/@cf-wasm/**/*.js"],
};

export default async function handler(req: NextRequest) {
  // url of image to fetch
  const imageUrl = "https://avatars.githubusercontent.com/u/314135";

  // fetch image and get the bytes
  const inputBytes = await fetch(imageUrl)
    .then((res) => res.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  // create a PhotonImage instance
  const inputImage = PhotonImage.new_from_byteslice(inputBytes);

  // resize image using photon
  const outputImage = resize(
    inputImage,
    inputImage.get_width() * 0.5,
    inputImage.get_height() * 0.5,
    SamplingFilter.Nearest,
  );

  // get webp bytes
  const outputBytes = outputImage.get_bytes_webp();

  // for other formats
  // png  : outputImage.get_bytes();
  // jpeg : outputImage.get_bytes_jpeg(quality);

  // call free() method to free memory
  inputImage.free();
  outputImage.free();

  return new Response(outputBytes, {
    headers: {
      "Content-Type": "image/webp",
    },
  });
}
```

### Web Worker

You can use `others` submodule and provide wasm binaries using `initPhoton` function to make it work on other runtime (i.e. `Browser`, `Web Worker`, etc).

> [!WARNING]
> The `others` submodule is yet experimental. Breaking changes may be introduced without following semantic versioning.

[@deox/worker-rpc](https://github.com/kumardeo/deox/tree/main/packages/worker-rpc) can make messaging even more easier when using web workers.

Here is a working example for Web Workers when using Webpack bundler:

Create a `worker.ts`:

```ts
import {
  initPhoton,
  PhotonImage,
  SamplingFilter,
  resize,
} from "@cf-wasm/photon/others";
import { register, withOptions } from "@deox/worker-rpc/register";

const registered = register(async () => {
  // The wasm must be initialized first, you can provide photon wasm binaries from any source
  await initPhoton({
    module_or_path: new URL("@cf-wasm/photon/photon.wasm", import.meta.url),
  });

  return {
    resize: async (source: string, format?: "webp" | "png" | "jpeg") => {
      // fetch the source image and get bytes
      const imageBytes = new Uint8Array(
        await (await fetch(source)).arrayBuffer(),
      );

      // create a PhotonImage instance
      const inputImage = PhotonImage.new_from_byteslice(imageBytes);

      // resize image using photon
      const outputImage = resize(
        inputImage,
        inputImage.get_width() * 0.5,
        inputImage.get_height() * 0.5,
        SamplingFilter.Nearest,
      );

      let outputBytes: Uint8Array;

      switch (format) {
        case "png":
          // get png bytes
          outputBytes = outputImage.get_bytes();
          break;

        case "jpeg":
          // get jpeg bytes
          outputBytes = outputImage.get_bytes_jpeg(1);
          break;

        default:
          // get webp bytes
          outputBytes = outputImage.get_bytes_webp();
      }

      // Explicitly free rust memory
      outputImage.free();
      inputImage.free();

      // transfer bytes to main thread
      return withOptions(outputBytes, [outputBytes.buffer]);
    },
  };
});

export type Registered = typeof registered;
```

Now you can use it in your entrypoints:

```ts
import { Worker } from "@deox/worker-rpc";
import type { Registered } from "./worker";

const worker = new Worker<Registered>(
  new URL("./worker", import.meta.url),
  undefined,
);

const element = document.getElementById("demo_image") as HTMLImageElement;

worker.proxy
  .resize("https://avatars.githubusercontent.com/u/100576030")
  .then((bytes) => {
    const url = URL.createObjectURL(new Blob([bytes]));

    element.src = url;
  });
```

## Documentation

To explore all the functions, visit the [official documentation](https://docs.rs/photon-rs/).

## Reporting issues

This library is a fork of [`silvia-odwyer/photon`](https://github.com/silvia-odwyer/photon), so consider opening issues or feature requests there.

For WebAssembly-related issues, you can open an issue in this repository.

## Awesome Projects

Following is a list of projects built using this library:

- [Next Image Processing API](https://github.com/yoeven/next-image-processing-api) (by [Yoeven D Khemlani](https://github.com/yoeven))

## Credits

All credit goes to [@silvia-odwyer/photon](https://github.com/silvia-odwyer/photon).
