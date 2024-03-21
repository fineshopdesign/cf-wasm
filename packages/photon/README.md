# photon

Powered by [@silvia-odwyer/photon](https://www.npmjs.com/package/@silvia-odwyer/photon)
Forked at [a2cefcb](https://github.com/silvia-odwyer/photon/commit/a2cefcb3bf31b14a9e61508364b5ea88842d614b)

## Installation

Install the package by running the following command in terminal:

```sell
npm install @cf-wasm/photon
```

## Usage

- Cloudflare workers:
  `import * as photon from "@cf-wasm/photon";`
- Next.js (Webpack):
  `import * as photon from "@cf-wasm/photon/next";`
- CJS (file base):
  `import * as photon from "@cf-wasm/photon/node"';`

## Example

Here is an example for Cloudflare Workers in which image is being resized and converted to webp format:

```ts
import * as photon from "@cf-wasm/photon";

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

    // get webp bytes
    const outputBytes = outputImage.get_bytes_webp();

    // for other formats
    // png  : outputImage.get_bytes();
    // jpeg : outputImage.get_bytes_jpeg(quality);

    // create a Response instance
    const imageResponse = new Response(outputBytes, {
      headers: {
        "Content-Type": "image/webp"
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

## Documentation

To explore all the functions, view the [official documentation](https://docs.rs/photon-rs/).
