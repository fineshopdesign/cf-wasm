---
"@cf-wasm/photon": patch
"@cf-wasm/satori": patch
"@cf-wasm/resvg": patch
"@cf-wasm/png": patch
"@cf-wasm/og": patch
---

fix: ensure `import.meta` is being used only in ES Module scope and `__filename` or `__dirname` only in Common JS scope to prevent the errors such as `__dirname is not defined in ES module scope`
chore: add the `node:` prefix in Node.js core module imports
