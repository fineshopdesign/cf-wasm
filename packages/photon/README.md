# @cf-wam/photon

Photon library for Cloudflare workers, Next.js and Node.js.  
Powered by [@silvia-odwyer/photon](https://www.npmjs.com/package/@silvia-odwyer/photon)  
Forked at [a2cefcb](https://github.com/silvia-odwyer/photon/commit/a2cefcb3bf31b14a9e61508364b5ea88842d614b)

## Installation

Install the package by running the following command in terminal:

```shell
npm install @cf-wasm/photon
```

## Usage

- Cloudflare workers:  
  `import * as photon from "@cf-wasm/photon";`
- Next.js (Webpack):  
  `import * as photon from "@cf-wasm/photon/next";`
- CJS (file base):  
  `import * as photon from "@cf-wasm/photon/node"';`

## Examples

Here are some examples in which image is being resized and converted to webp format:

### Cloudflare Workers

If you are using Cloudflare Workers, you can use it as shown below:

```ts
// src/index.ts
import * as photon from "@cf-wasm/photon";

export type Env = Readonly<{}>;

const workers: ExportedHandler<Env> = {
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

    // get webp bytes
    const outputBytes = outputImage.get_bytes_webp();

    // for other formats
    // png  : outputImage.get_bytes();
    // jpeg : outputImage.get_bytes_jpeg(quality);

    // call free() method to free memory
    inputImage.free();
    outputImage.free();

    // return the Response instance
    return new Response(outputBytes, {
      headers: {
        "Content-Type": "image/webp"
      }
    });
  }
};

export default workers;

```

### Next.js (App Router)

If you are using Next.js (App router) with edge runtime, you can use it as shown below:

```ts
// (src/)app/api/image/route.ts
import { type NextRequest } from "next/server";
import * as photon from "@cf-wasm/photon/next";

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

  // get webp bytes
  const outputBytes = outputImage.get_bytes_webp();

  // for other formats
  // png  : outputImage.get_bytes();
  // jpeg : outputImage.get_bytes_jpeg(quality);

  // call free() method to free memory
  inputImage.free();
  outputImage.free();

  // return the Response instance
  return new Response(outputBytes, {
    headers: {
      "Content-Type": "image/webp"
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

export const config = {
  runtime: "edge",
  // see https://nextjs.org/docs/messages/edge-dynamic-code-evaluation
  unstable_allowDynamic: ["**/node_modules/@cf-wasm/photon/**/*.js"]
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

  // get webp bytes
  const outputBytes = outputImage.get_bytes_webp();

  // for other formats
  // png  : outputImage.get_bytes();
  // jpeg : outputImage.get_bytes_jpeg(quality);

  // call free() method to free memory
  inputImage.free();
  outputImage.free();

  // return the Response instance
  return new Response(outputBytes, {
    headers: {
      "Content-Type": "image/webp"
    }
  });
}

```

## Documentation

To explore all the functions, view the [official documentation](https://docs.rs/photon-rs/).
