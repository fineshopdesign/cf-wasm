# @cf-wasm/og

## 0.1.22

### Patch Changes

- Updated dependencies [[`123f049`](https://github.com/fineshopdesign/cf-wasm/commit/123f0494287fd90fa7970a085c1735c0b76f88b3)]:
  - @cf-wasm/resvg@0.1.17

## 0.1.21

### Patch Changes

- [`ac47ba9`](https://github.com/fineshopdesign/cf-wasm/commit/ac47ba9d7a15cac06cc9ee313f750aee996ad49d) Thanks [@fineshop](https://github.com/fineshop)! - feat: introduced new function `renderFigma`

## 0.1.20

### Patch Changes

- [`7f00ec0`](https://github.com/fineshopdesign/cf-wasm/commit/7f00ec06f67cbfd3b9f494d43a18ac6fec59f498) Thanks [@fineshop](https://github.com/fineshop)! - fix: ensure `import.meta` is being used only in ES Module scope and `__filename` or `__dirname` only in Common JS scope to prevent the errors such as `__dirname is not defined in ES module scope`
  chore: add the `node:` prefix in Node.js core module imports
- Updated dependencies [[`7f00ec0`](https://github.com/fineshopdesign/cf-wasm/commit/7f00ec06f67cbfd3b9f494d43a18ac6fec59f498)]:
  - @cf-wasm/satori@0.1.16
  - @cf-wasm/resvg@0.1.16

## 0.1.19

### Patch Changes

- [`a35fe1f`](https://github.com/fineshopdesign/cf-wasm/commit/a35fe1fd85388e5ff17de7c6b477c38155c22a61) Thanks [@fineshop](https://github.com/fineshop)! - fix: use esbuild for building modules to fix errors such as `ERR_MODULE_NOT_FOUND`, `ERR_UNSUPPORTED_DIR_IMPORT`, etc.

- Updated dependencies [[`a35fe1f`](https://github.com/fineshopdesign/cf-wasm/commit/a35fe1fd85388e5ff17de7c6b477c38155c22a61)]:
  - @cf-wasm/satori@0.1.15
  - @cf-wasm/resvg@0.1.15

## 0.1.18

### Patch Changes

- [`058910e`](https://github.com/fineshopdesign/cf-wasm/commit/058910e62cfb65e0796eba0be383a56d883ff6cb) Thanks [@fineshop](https://github.com/fineshop)! - refactor: separate directory (./dist/dts) for .d.ts files to minimize bundle size

- Updated dependencies [[`058910e`](https://github.com/fineshopdesign/cf-wasm/commit/058910e62cfb65e0796eba0be383a56d883ff6cb)]:
  - @cf-wasm/satori@0.1.14
  - @cf-wasm/resvg@0.1.14

## 0.1.17

### Patch Changes

- [`544d90c`](https://github.com/fineshopdesign/cf-wasm/commit/544d90c60647139f451ffed0698003c5b1039aca) Thanks [@fineshop](https://github.com/fineshop)! - fix(og): `FigmaResponse` (experimental) wasn't working at all
  refactor(og): improved error handling and caching

  Notes: If you find any bug using `FigmaResponse`, please consider open an issue.
  If you are using `@cf-wasm/og` on `Cloudflare Workers`, you may hit the [CPU time limit](https://developers.cloudflare.com/workers/platform/limits/#cpu-time). Even when using the original project `@vercel/og` on `Cloudflare Pages`, you hit these limits.

- [`a7f343f`](https://github.com/fineshopdesign/cf-wasm/commit/a7f343f7dc8537d00e7aceacaf0501b003bebba1) Thanks [@fineshop](https://github.com/fineshop)! - refactor(og): pass only the default font to resvg.render function

## 0.1.16

### Patch Changes

- [`8f0b517`](https://github.com/fineshopdesign/cf-wasm/commit/8f0b51789d79bf3b251bb87eb3df7a25e09a6865) Thanks [@fineshop](https://github.com/fineshop)! - feat(og): add support for html string as input for rendering images

## 0.1.15

### Patch Changes

- [`8b56731`](https://github.com/fineshopdesign/cf-wasm/commit/8b567314f273adea4ec2af72ee9c05f894e212e4) Thanks [@fineshop](https://github.com/fineshop)! - feat: add submodule `others` (experimental)

- Updated dependencies [[`8b56731`](https://github.com/fineshopdesign/cf-wasm/commit/8b567314f273adea4ec2af72ee9c05f894e212e4)]:
  - @cf-wasm/satori@0.1.13
  - @cf-wasm/resvg@0.1.13

## 0.1.14

### Patch Changes

- [`603a8d5`](https://github.com/fineshopdesign/cf-wasm/commit/603a8d5c89aee22c9d7488b4ea1ed75f56ed9e75) Thanks [@fineshop](https://github.com/fineshop)! - perf(og): improved caching for dynamic assets

## 0.1.13

### Patch Changes

- [`deaf885`](https://github.com/fineshopdesign/cf-wasm/commit/deaf885730bf894c41c800fb0079359e53715598) Thanks [@fineshop](https://github.com/fineshop)! - refactor(og): log detailed information about errors
  fix(og): check if Buffer class is available for base64 encoding otherwise use btoa global function if available

## 0.1.12

### Patch Changes

- [`51a4f37`](https://github.com/fineshopdesign/cf-wasm/commit/51a4f37043ec76f418e12817f35f9df62b3f8bf5) Thanks [@fineshop](https://github.com/fineshop)! - fix(og): added support for next-on-pages (for next.js on cloudflare pages)

- Updated dependencies []:
  - @cf-wasm/resvg@0.1.12
  - @cf-wasm/satori@0.1.12

## 0.1.11

### Patch Changes

- [`e2e9798`](https://github.com/fineshopdesign/cf-wasm/commit/e2e9798f817e3ca0e45f759ba6c623ee88ba9ab3) Thanks [@fineshop](https://github.com/fineshop)! - chore(photon): update build process
  chore(png): update build process
  chore: new packages `resvg`, `satori` and `og`
- Updated dependencies [[`e2e9798`](https://github.com/fineshopdesign/cf-wasm/commit/e2e9798f817e3ca0e45f759ba6c623ee88ba9ab3)]:
  - @cf-wasm/resvg@0.1.11
  - @cf-wasm/satori@0.1.11
