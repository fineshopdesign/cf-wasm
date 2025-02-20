# Cloudflare WASM Modules

A collection of WASM packages those work on Cloudflare Workers.

## Packages

This monorepo contains the following packages:

### [@cf-wasm/photon](./packages/photon/README.md)

A high-performance image processing library.  
Powered by [@silvia-odwyer/photon](https://github.com/silvia-odwyer/photon).  

Compatible with:

* Cloudflare Workers
* Next.js (Edge runtime)
* Node.js

### [@cf-wasm/png](./packages/png/README.md)

A simple wasm png encoder/decoder module for Cloudflare Workers, Next.js and Node.  
Powered by [@denosaurs/pngs](https://github.com/denosaurs/pngs).  

Compatible with:

* Cloudflare Workers
* Next.js (Edge runtime)
* Node.js

### [@cf-wasm/quickjs](./packages/quickjs/README.md)

A high-performance, secure, extensible JavaScript runtime.  
Powered by [quickjs-emscripten](https://github.com/justjake/quickjs-emscripten)

Compatible with:

* Cloudflare Workers
* Next.js (Edge runtime)
* Node.js

### [@cf-wasm/resvg](./packages/resvg/README.md)

A high-performance SVG renderer and toolkit, powered by Rust based resvg.  
Powered by [@resvg/resvg-wasm](https://github.com/thx/resvg-js/tree/main/wasm).  

Compatible with:

* Cloudflare Workers
* Next.js (Edge runtime)
* Node.js

### [@cf-wasm/satori](./packages/satori/README.md)

Enlightened library to convert HTML and CSS to SVG.  
Powered by [satori](https://github.com/vercel/satori).  

Compatible with:

* Cloudflare Workers
* Next.js (Edge runtime)
* Node.js

### [@cf-wasm/og](./packages/og/README.md)

Generate Open Graph Images dynamically from HTML/CSS without a browser.  
Powered by [@vercel/og](https://www.npmjs.com/package/@vercel/og).  

Compatible with:

* Cloudflare Workers
* Next.js (Edge runtime)
* Node.js 

### Acknowledgments

 - **Thanks to DuCanhGH for the workflows and issue templates**, which I shamelessly copied and modified from one of his open-source projects.
