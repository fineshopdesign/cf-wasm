---
"@cf-wasm/photon": patch
"@cf-wasm/satori": patch
"@cf-wasm/resvg": patch
"@cf-wasm/png": patch
"@cf-wasm/og": patch
---

fix: use esbuild for building modules to fix errors such as `ERR_MODULE_NOT_FOUND`, `ERR_UNSUPPORTED_DIR_IMPORT`, etc.
