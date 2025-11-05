import type * as resvgModule from '@cf-wasm/resvg/legacy';

export type ResvgModule = Omit<typeof resvgModule, 'resvgWasmModule'>;
export type * from '@cf-wasm/resvg/legacy';
