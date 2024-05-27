import type * as resvgModule from '@cf-wasm/resvg/2.4.1';

export type ResvgModule = Omit<typeof resvgModule, 'MODULE'>;
export type * from '@cf-wasm/resvg/2.4.1';
