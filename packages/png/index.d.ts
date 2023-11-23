/* tslint:disable */
/* eslint-disable */
/**
 * @param {Uint8Array} image
 * @param {number} width
 * @param {number} height
 * @param {Uint8Array | undefined} palette
 * @param {Uint8Array | undefined} trns
 * @param {number | undefined} color
 * @param {number | undefined} depth
 * @param {number | undefined} compression
 * @param {number | undefined} filter
 * @returns {Uint8Array}
 */
export function wasmEncode(
  image: Uint8Array,
  width: number,
  height: number,
  palette?: Uint8Array,
  trns?: Uint8Array,
  color?: number,
  depth?: number,
  compression?: number,
  filter?: number
): Uint8Array;
/**
 * @param {Uint8Array} image
 * @returns {any}
 */
export function wasmDecode(image: Uint8Array): any;
/**
 */
export class DecodeResult {
  free(): void;
}

type ValueOf<T> = T[keyof T];

export const ColorType = {
  Grayscale: 0,
  RGB: 2,
  Indexed: 3,
  GrayscaleAlpha: 4,
  RGBA: 6
};

export const BitDepth = {
  One: 1,
  Two: 2,
  Four: 4,
  Eight: 8,
  Sixteen: 16
};

export const Compression = {
  Default: 0,
  Fast: 1,
  Best: 2,
  Huffman: 3,
  Rle: 4
};

export const FilterType = {
  NoFilter: 0,
  Sub: 1,
  Up: 2,
  Avg: 3,
  Paeth: 4
};

export interface DecodedResult {
  image: Uint8Array;
  width: number;
  height: number;
  colorType: ValueOf<typeof ColorType>;
  bitDepth: ValueOf<typeof BitDepth>;
  lineSize: number;
}

export function encode(
  image: Uint8Array,
  width: number,
  height: number,
  options?: {
    palette?: Uint8Array;
    trns?: Uint8Array;
    color?: ValueOf<typeof ColorType>;
    depth?: ValueOf<typeof BitDepth>;
    compression?: ValueOf<typeof Compression>;
    filter?: ValueOf<typeof FilterType>;
    stripAlpha?: boolean;
  }
): Uint8Array;

export function decode(image: Uint8Array): DecodedResult;

export type InitInput =
  | RequestInfo
  | URL
  | Response
  | BufferSource
  | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly encode: (
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
    g: number,
    h: number,
    i: number,
    j: number,
    k: number,
    l: number,
    m: number
  ) => void;
  readonly __wbg_decoderesult_free: (a: number) => void;
  readonly decode: (a: number, b: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_malloc: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
 * Instantiates the given `module`, which can either be bytes or
 * a precompiled `WebAssembly.Module`.
 *
 * @param {SyncInitInput} module
 *
 * @returns {InitOutput}
 */
export function initSync(module: SyncInitInput): InitOutput;

export function initCloudflare(): InitOutput;

/**
 * If `module_or_path` is {RequestInfo} or {URL}, makes a request and
 * for everything else, calls `WebAssembly.instantiate` directly.
 *
 * @param {InitInput | Promise<InitInput>} module_or_path
 *
 * @returns {Promise<InitOutput>}
 */
export default function __wbg_init(
  module_or_path?: InitInput | Promise<InitInput>
): Promise<InitOutput>;
