# png

A simple wasm png encoder/decoder module for Cloudflare Workers, Next.js and Node.

## Installation

Install the package by running the following command in terminal:

```sell
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

```js
import * as photon from "@cf-wasm/photon";
import * as png from "@cf-wasm/png";

const worker = {
 async fetch() {
  const imageUrl = "https://avatars.githubusercontent.com/u/314135";

  const imageBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer());
  const imageBytes = new Uint8Array(imageBuffer);

  const inputImage = photon.PhotonImage.new_from_byteslice(imageBytes);

  // resizing using photon
  const outputImage = photon.resize(
   inputImage,
   inputImage.get_width() * 0.5,
   inputImage.get_height() * 0.5,
   1
  );

  // encoding using png
  const outputPng = png.encode(
   outputImage.get_raw_pixels(),
   outputImage.get_width(),
   outputImage.get_height()
  );

  const imageResponse = new Response(outputPng, {
   headers: {
    "Content-Type": "image/png"
   }
  });

  inputImage.free();
  outputImage.free();

  return imageResponse;
 }
};

export default worker;
```
