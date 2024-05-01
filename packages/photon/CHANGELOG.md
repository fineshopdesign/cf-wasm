# @cf-wasm/photon

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

## 0.1.10

### Patch Changes

- [`41369f0`](https://github.com/fineshopdesign/cf-wasm/commit/41369f0682c0f1dcdb35bd28d845dd9db6aafe06) Thanks [@fineshop](https://github.com/fineshop)! - docs(photon): added examples for Next.js
  docs(png): added examples for Next.js

## 0.1.9

### Patch Changes

- [`9f57cd2`](https://github.com/fineshopdesign/cf-wasm/commit/9f57cd256b7a9c761804324ef490fdaf983ed67b) Thanks [@fineshop](https://github.com/fineshop)! - add get_bytes_webp (photon)

## 0.1.8

### Patch Changes

- [`1218209`](https://github.com/fineshopdesign/cf-wasm/commit/12182097289df26d4b653af80b447db2a0a58b30) Thanks [@fineshop](https://github.com/fineshop)! - This patch fixes invalid exports for type declarations

## 0.1.7

### Patch Changes

- [`2fc9286`](https://github.com/fineshopdesign/cf-wasm/commit/2fc92860d612421444a87bff3334da68870a16aa) Thanks [@fineshop](https://github.com/fineshop)! - Fix support for node js

## 0.1.6

### Patch Changes

- [`9974c5b`](https://github.com/fineshopdesign/cf-wasm/commit/9974c5b4366c7fd882e6b10545305b1ddb01fb9a) Thanks [@fineshop](https://github.com/fineshop)! - Implemented npm package signing using GitHub Actions

## 0.1.5

### Patch Changes

- [`80749f8`](https://github.com/fineshopdesign/cf-wasm/commit/80749f87e08f5399328a6a8454ddee6d469bde2f) Thanks [@fineshop](https://github.com/fineshop)! - Added support for Next.js
