# @cf-wasm/png

A simple wasm png encoder/decoder module for Cloudflare Workers, Next.js and Node.  

Powered by [denosaurs/pngs](https://github.com/denosaurs/pngs).

## Installation

```shell
npm install @cf-wasm/png       # npm
yarn add @cf-wasm/png          # yarn
pnpm add @cf-wasm/png          # pnpm
```

## Usage

- Cloudflare Workers / Pages (Esbuild):

  ```ts
  import { encode } from "@cf-wasm/png";
  ```

- Next.js Edge Runtime (Webpack):

  ```ts
  import { encode } from "@cf-wasm/png/next";
  ```

- Node.js (file base):

  ```ts
  import { encode } from "@cf-wasm/png/node";
  ```

## API

### encode

The `encode` function encodes an input `Uint8Array` representing an image into a PNG format.

```ts
const encode: (
  image: Uint8Array,
  width: number,
  height: number,
  options?: EncodeOptions
) => Uint8Array
```

### decode

The `decode` function decodes an input `Uint8Array` representing a PNG image.

```ts
const decode: (image: Uint8Array) => {
    image: Uint8Array;
    width: number;
    height: number;
    colorType: number;
    bitDepth: number;
    lineSize: number;
}
```

## Examples

Here are some examples for using this library.

### Cloudflare Workers

If you are using Cloudflare Workers, you can use it as shown below:

```ts
// src/index.ts
import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon";
import { encode } from "@cf-wasm/png";

export default {
  async fetch() {
    // url of image to fetch
    const imageUrl = "https://avatars.githubusercontent.com/u/314135";

    // fetch image and get the Uint8Array instance
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
      SamplingFilter.Nearest
    );

    // encode using png
    const outputBytes = encode(
     outputImage.get_raw_pixels(),
     outputImage.get_width(),
     outputImage.get_height()
    );

    // call free() method to free memory
    inputImage.free();
    outputImage.free();

    // return the Response instance
    return new Response(outputBytes, {
      headers: {
        "Content-Type": "image/png"
      }
    });
  }
} satisfies ExportedHandler;
```

### Next.js (App Router)

If you are using Next.js (App router) with edge runtime, you can use it as shown below:

```ts
// (src/)app/api/image/route.ts
import { type NextRequest } from "next/server";
import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon";
import { encode } from "@cf-wasm/png";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // url of image to fetch
  const imageUrl = "https://avatars.githubusercontent.com/u/314135";

  // fetch image and get the Uint8Array instance
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
    SamplingFilter.Nearest
  );

  // encode using png
  const outputBytes = encode(
    outputImage.get_raw_pixels(),
    outputImage.get_width(),
    outputImage.get_height()
  );

  // call free() method to free memory
  inputImage.free();
  outputImage.free();

  // return the Response instance
  return new Response(outputBytes, {
    headers: {
      "Content-Type": "image/png"
    }
  });
}
```

### Next.js (Pages Router)

If you are using Next.js (Pages router) with edge runtime, you can use it as shown below:

```ts
// (src/)pages/api/image.ts
import { type NextRequest } from "next/server";
import { PhotonImage, SamplingFilter, resize } from "@cf-wasm/photon";
import { encode } from "@cf-wasm/png";

export const config = {
  runtime: "edge",
  // see https://nextjs.org/docs/messages/edge-dynamic-code-evaluation
  unstable_allowDynamic: [
    "**/node_modules/@cf-wasm/**/*.js"
  ]
};

export default async function handler(req: NextRequest) {
  // url of image to fetch
  const imageUrl = "https://avatars.githubusercontent.com/u/314135";

  // fetch image and get the Uint8Array instance
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
    SamplingFilter.Nearest
  );

  // encode using png
  const outputBytes = encode(
    outputImage.get_raw_pixels(),
    outputImage.get_width(),
    outputImage.get_height()
  );

  // call free() method to free memory
  inputImage.free();
  outputImage.free();

  // return the Response instance
  return new Response(outputBytes, {
    headers: {
      "Content-Type": "image/png"
    }
  });
}
```

## Credits

All credit goes to [denosaurs/pngs](https://github.com/denosaurs/pngs).
