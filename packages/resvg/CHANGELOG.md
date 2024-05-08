# @cf-wasm/resvg

## 0.1.17

### Patch Changes

- [`123f049`](https://github.com/fineshopdesign/cf-wasm/commit/123f0494287fd90fa7970a085c1735c0b76f88b3) Thanks [@fineshop](https://github.com/fineshop)! - fix: initialize function in `others` submodule

## 0.1.16

### Patch Changes

- [`7f00ec0`](https://github.com/fineshopdesign/cf-wasm/commit/7f00ec06f67cbfd3b9f494d43a18ac6fec59f498) Thanks [@fineshop](https://github.com/fineshop)! - fix: ensure `import.meta` is being used only in ES Module scope and `__filename` or `__dirname` only in Common JS scope to prevent the errors such as `__dirname is not defined in ES module scope`
  chore: add the `node:` prefix in Node.js core module imports

## 0.1.15

### Patch Changes

- [`a35fe1f`](https://github.com/fineshopdesign/cf-wasm/commit/a35fe1fd85388e5ff17de7c6b477c38155c22a61) Thanks [@fineshop](https://github.com/fineshop)! - fix: use esbuild for building modules to fix errors such as `ERR_MODULE_NOT_FOUND`, `ERR_UNSUPPORTED_DIR_IMPORT`, etc.

## 0.1.14

### Patch Changes

- [`058910e`](https://github.com/fineshopdesign/cf-wasm/commit/058910e62cfb65e0796eba0be383a56d883ff6cb) Thanks [@fineshop](https://github.com/fineshop)! - refactor: separate directory (./dist/dts) for .d.ts files to minimize bundle size

## 0.1.13

### Patch Changes

- [`8b56731`](https://github.com/fineshopdesign/cf-wasm/commit/8b567314f273adea4ec2af72ee9c05f894e212e4) Thanks [@fineshop](https://github.com/fineshop)! - feat: add submodule `others` (experimental)

## 0.1.12

## 0.1.11

### Patch Changes

- [`e2e9798`](https://github.com/fineshopdesign/cf-wasm/commit/e2e9798f817e3ca0e45f759ba6c623ee88ba9ab3) Thanks [@fineshop](https://github.com/fineshop)! - chore(photon): update build process
  chore(png): update build process
  chore: new packages `resvg`, `satori` and `og`
