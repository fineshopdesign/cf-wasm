# photon

Powered by [@silvia-odwyer/photon](https://www.npmjs.com/package/@silvia-odwyer/photon)

**Note**: This package **only works** on **Cloudflare Workers**.

## Installation

---

Install the package by running the following command in terminal:

```sell
npm install @cf-wasm/photon
```

## Initialization

---

In your Cloudflare Workers script, import and initialize the module:

```ts
import * as photon from "@cf-wasm/photon";

// Initialization
photon.initCloudflare();

const worker = {
  fetch() {
    //...
  }
};

export default worker;
```

## Example

---

Usage in Cloudflare Workers:

```js
import * as photon from "@cf-wasm/photon";
import * as png from "@cf-wasm/png";

photon.initCloudflare();
png.initCloudflare();

const worker = {
  async fetch() {
    const imageUrl = "https://avatars.githubusercontent.com/u/314135";

    const imageBuffer = await fetch(imageUrl).then((res) => res.arrayBuffer());
    const imageBytes = new Uint8Array(imageBuffer);

    const inputImage = photon.PhotonImage.new_from_byteslice(imageBytes);

    // resizing using photon
    const outputImage = photon.resize(inputImage, inputImage.get_width() * 0.5, inputImage.get_height() * 0.5, 1);

    // encoding using png
    const outputPng = png.encode(outputImage.get_raw_pixels(), outputImage.get_width(), outputImage.get_height());

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

## Documentation

---

To explore all the functions, view the [official documentation](https://docs.rs/photon-rs/).
