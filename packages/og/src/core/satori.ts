import type * as satoriModule from '@cf-wasm/satori';

export type SatoriModule = Omit<typeof satoriModule, 'YOGA_MODULE'>;
export type * from '@cf-wasm/satori';
