import type * as satoriModule from '@cf-wasm/satori';

export type SatoriModule = Omit<typeof satoriModule, 'yogaWasmModule'>;
export type * from '@cf-wasm/satori';
