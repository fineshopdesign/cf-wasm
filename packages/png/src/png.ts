import initAsync, {
  DecodeResult,
  type InitInput,
  type InitOutput,
  initSync,
  type SyncInitInput,
  decode as wasmDecode,
  encode as wasmEncode,
} from './lib/png';

export const ColorType = {
  Grayscale: 0,
  RGB: 2,
  Indexed: 3,
  GrayscaleAlpha: 4,
  RGBA: 6,
};

export const BitDepth = {
  One: 1,
  Two: 2,
  Four: 4,
  Eight: 8,
  Sixteen: 16,
};

export const Compression = {
  Default: 0,
  Fast: 1,
  Best: 2,
  Huffman: 3,
  Rle: 4,
};

export const FilterType = {
  NoFilter: 0,
  Sub: 1,
  Up: 2,
  Avg: 3,
  Paeth: 4,
};

type ValueOf<T> = T[keyof T];

export interface DecodedImageResult {
  image: Uint8Array;
  width: number;
  height: number;
  colorType: ValueOf<typeof ColorType>;
  bitDepth: ValueOf<typeof BitDepth>;
  lineSize: number;
}

export interface EncodeOptions {
  palette?: Uint8Array;
  trns?: Uint8Array;
  color?: ValueOf<typeof ColorType>;
  depth?: ValueOf<typeof BitDepth>;
  compression?: ValueOf<typeof Compression>;
  filter?: ValueOf<typeof FilterType>;
  stripAlpha?: boolean;
}

export function encode(image: Uint8Array, width: number, height: number, options?: EncodeOptions) {
  return wasmEncode(
    image,
    width,
    height,
    options?.palette,
    options?.trns,
    options?.color ?? ColorType.RGBA,
    options?.depth ?? BitDepth.Eight,
    options?.compression,
    options?.filter,
  );
}

export function decode(image: Uint8Array) {
  const res = wasmDecode(image) as DecodedImageResult;

  return {
    image: new Uint8Array(res.image),
    width: res.width,
    height: res.height,
    colorType: res.colorType,
    bitDepth: res.bitDepth,
    lineSize: res.lineSize,
  };
}

export default initAsync;
export { DecodeResult, wasmDecode, wasmEncode, type InitInput, type InitOutput, initSync, type SyncInitInput };
