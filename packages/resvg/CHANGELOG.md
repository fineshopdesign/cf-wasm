# @cf-wasm/resvg

## 0.3.1

### Patch Changes

- [`259607c`](https://github.com/fineshopdesign/cf-wasm/commit/259607cdca378b8eef503b582a6377654f7922c1) Thanks [@kumardeo](https://github.com/kumardeo)! - chore: rename `next` submodule to `edge-light`

## 0.3.0

### Minor Changes

- [`16be3db`](https://github.com/fineshopdesign/cf-wasm/commit/16be3db81988132fa8e8abed0f6f4f22597f035e) Thanks [@kumardeo](https://github.com/kumardeo)! - feat: conditional exports for main modules

## 0.2.3

### Patch Changes

- [`95bb5c7`](https://github.com/fineshopdesign/cf-wasm/commit/95bb5c7654870bcf2ee82764884489448c0960a4) Thanks [@kumardeo](https://github.com/kumardeo)! - feat: rename `Resvg.create` to `Resvg.async`

## 0.2.2

### Patch Changes

- [`b94f7de`](https://github.com/fineshopdesign/cf-wasm/commit/b94f7de5bec4e1ebfc0c2d2b0bb884bf54c22b7c) Thanks [@kumardeo](https://github.com/kumardeo)! - chore(build): set `platform` to `neutral` in `tsup.config.ts`

## 0.2.1

### Patch Changes

- [`33a579f`](https://github.com/fineshopdesign/cf-wasm/commit/33a579f743db8e69acb8664a532227064cc8d306) Thanks [@kumardeo](https://github.com/kumardeo)! - fix: improve `initResvg` function

## 0.2.0

### Minor Changes

- [`9dc03e0`](https://github.com/fineshopdesign/cf-wasm/commit/9dc03e0597e5b5d709845496c010cbcf08150d3d) Thanks [@kumardeo](https://github.com/kumardeo)! - chore: use `tsup` for bundling

- [`9dc03e0`](https://github.com/fineshopdesign/cf-wasm/commit/9dc03e0597e5b5d709845496c010cbcf08150d3d) Thanks [@kumardeo](https://github.com/kumardeo)! - chore: `workers` submodule is renamed to `workerd`

## 0.1.24

### Patch Changes

- [`b603ad0`](https://github.com/fineshopdesign/cf-wasm/commit/b603ad006dfebedf333582090b54ac7be86b94b2) Thanks [@fineshop](https://github.com/fineshop)! - fix: add `default` conditional exports for `.wasm` and `.txt` files

## 0.1.23

### Patch Changes

- [`444362c`](https://github.com/fineshopdesign/cf-wasm/commit/444362c8e68c1f27220788f9ff2de780b861b34a) Thanks [@fineshop](https://github.com/fineshop)! - refactor: `initResvg` function

## 0.1.22

### Patch Changes

- [`9743f01`](https://github.com/fineshopdesign/cf-wasm/commit/9743f01376f3bb995ddb678dae438a1ed471beb0) Thanks [@fineshop](https://github.com/fineshop)! - chore: remove unnecessary `default` conditional exports

## 0.1.21

### Patch Changes

- [`b07af65`](https://github.com/fineshopdesign/cf-wasm/commit/b07af651316223f32d9df9503c730d094dd256f4) Thanks [@fineshop](https://github.com/fineshop)! - docs: update README

## 0.1.20

### Patch Changes

- [`c90bbc8`](https://github.com/fineshopdesign/cf-wasm/commit/c90bbc8245d6e2e1b1b8bd4e72565cdc98a696ad) Thanks [@fineshop](https://github.com/fineshop)! - fix: package.json

## 0.1.19

### Patch Changes

- [`0cd4a37`](https://github.com/fineshopdesign/cf-wasm/commit/0cd4a372a4ef89e1c8e5a08db2c94d66758dc015) Thanks [@fineshop](https://github.com/fineshop)! - fix: package.json

## 0.1.18

### Patch Changes

- [`906211f`](https://github.com/fineshopdesign/cf-wasm/commit/906211f5001cdf7346851a9ab8a83bbb7705103e) Thanks [@fineshop](https://github.com/fineshop)! - feat: add submodules for version `2.4.1` since it is lightweight, it is being used by `@cf-wasm/og`

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
