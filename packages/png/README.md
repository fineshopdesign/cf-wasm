# png

A simple wasm png encoder/decoder module for Cloudflare Workers, Next.js and Node.

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
  `import * as png from "@cf-wasm/png/node"';`

## Examples

Example for Cloudflare Workers:

```ts
import * as photon from "@cf-wasm/photon";
import * as png from "@cf-wasm/png";

export type Env = Readonly<{}>;

const worker: ExportedHandler<Env> = {
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
    );;

    // create a Response instance
    const imageResponse = new Response(outputBytes, {
      headers: {
        "Content-Type": "image/png"
      }
    });

    // call free() method to free memory
    inputImage.free();
    outputImage.free();

    return imageResponse;
  }
};

export default worker;
```
