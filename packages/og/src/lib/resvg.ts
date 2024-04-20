import type * as resvgModule from "@cf-wasm/resvg";

export type ResvgModule = Omit<typeof resvgModule, "MODULE" | "ensureInit">;
export type * from "@cf-wasm/resvg";
