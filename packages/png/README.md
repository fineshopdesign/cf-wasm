# @cf-wasm/png

A simple wasm png encoder/decoder module for Cloudflare Workers, Next.js and Node.  

Powered by [denosaurs/pngs](https://github.com/denosaurs/pngs).

## Installation

Install the package by running the following command in terminal:

```shell
npm install @cf-wasm/png
```

## Usage

- Cloudflare workers:  
  `import * as png from "@cf-wasm/png";`
- Next.js (Webpack):  
  `import * as png from "@cf-wasm/png/next";`
- CJS (file base):  
  `import * as png from "@cf-wasm/png/node";`

## API

### png.encode

The `png.encode` function encodes an input `Uint8Array` representing an image into a PNG format.

```ts
const encode: (
  image: Uint8Array,
  width: number,
  height: number,
  options?: EncodeOptions
) => Uint8Array
```

### png.decode

The `png.decode` function decodes an input `Uint8Array` representing a PNG image.

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
import * as photon from "@cf-wasm/photon";
import * as png from "@cf-wasm/png";

const handlers: ExportedHandler = {
  async fetch() {
    // url of image to fetch
    const imageUrl = "https://avatars.githubusercontent.com/u/314135";

    // fetch image and get the Uint8Array instance
    const inputBytes = await fetch(imageUrl)
      .then((res) => res.arrayBuffer())
      .then((buffer) => new Uint8Array(buffer));

    // create a photon instance
    const inputImage = photon.PhotonImage.new_from_byteslice(inputBytes);

    // resize image using photon
    const outputImage = photon.resize(
      inputImage,
      inputImage.get_width() * 0.5,
      inputImage.get_height() * 0.5,
      1
    );

    // encode using png
    const outputBytes = png.encode(
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
};

export default handlers;
```

### Next.js (App Router)

If you are using Next.js (App router) with edge runtime, you can use it as shown below:

```ts
// (src/)app/api/image/route.ts
import { type NextRequest } from "next/server";
import * as photon from "@cf-wasm/photon/next";
import * as png from "@cf-wasm/png/next";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  // url of image to fetch
  const imageUrl = "https://avatars.githubusercontent.com/u/314135";

  // fetch image and get the Uint8Array instance
  const inputBytes = await fetch(imageUrl)
    .then((res) => res.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  // create a photon instance
  const inputImage = photon.PhotonImage.new_from_byteslice(inputBytes);

  // resize image using photon
  const outputImage = photon.resize(
    inputImage,
    inputImage.get_width() * 0.5,
    inputImage.get_height() * 0.5,
    1
  );

  // encode using png
  const outputBytes = png.encode(
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
import * as photon from "@cf-wasm/photon/next";
import * as png from "@cf-wasm/png/next";

export const config = {
  runtime: "edge",
  // see https://nextjs.org/docs/messages/edge-dynamic-code-evaluation
  unstable_allowDynamic: [
    "**/node_modules/@cf-wasm/photon/**/*.js",
    "**/node_modules/@cf-wasm/png/**/*.js"
  ]
};

export default async function handler(req: NextRequest) {
  // url of image to fetch
  const imageUrl = "https://avatars.githubusercontent.com/u/314135";

  // fetch image and get the Uint8Array instance
  const inputBytes = await fetch(imageUrl)
    .then((res) => res.arrayBuffer())
    .then((buffer) => new Uint8Array(buffer));

  // create a photon instance
  const inputImage = photon.PhotonImage.new_from_byteslice(inputBytes);

  // resize image using photon
  const outputImage = photon.resize(
    inputImage,
    inputImage.get_width() * 0.5,
    inputImage.get_height() * 0.5,
    1
  );

  // encode using png
  const outputBytes = png.encode(
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
