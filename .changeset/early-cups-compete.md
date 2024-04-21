---
"@cf-wasm/og": patch
---

fix(og): `FigmaResponse` (experimental) wasn't working at all  
refactor(og): improved error handling and caching

Notes: If you find any bug using `FigmaResponse`, please consider open an issue.  
If you are using `@cf-wasm/og` on `Cloudflare Workers`, you may hit the [CPU time limit](https://developers.cloudflare.com/workers/platform/limits/#cpu-time). Even when using the original project `@vercel/og` on `Cloudflare Pages`, you hit these limits.
