import wasmModule from "./png_bg.wasm";

let wasm;

let cachedTextDecoder = new TextDecoder("utf-8", {
  ignoreBOM: true,
  fatal: true
});

cachedTextDecoder.decode();

let cachegetUint8Memory0 = null;
function getUint8Memory0() {
  if (
    cachegetUint8Memory0 === null ||
    cachegetUint8Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
  return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(32).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];

  heap[idx] = obj;
  return idx;
}

function getObject(idx) {
  return heap[idx];
}

function dropObject(idx) {
  if (idx < 36) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg, malloc) {
  const ptr = malloc(arg.length * 1);
  getUint8Memory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

function isLikeNone(x) {
  return x === undefined || x === null;
}

let cachegetInt32Memory0 = null;
function getInt32Memory0() {
  if (
    cachegetInt32Memory0 === null ||
    cachegetInt32Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachegetInt32Memory0;
}

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

function getArrayU8FromWasm0(ptr, len) {
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
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
  image,
  width,
  height,
  palette,
  trns,
  color,
  depth,
  compression,
  filter
) {
  try {
    const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
    var ptr0 = passArray8ToWasm0(image, wasm.__wbindgen_malloc);
    var len0 = WASM_VECTOR_LEN;
    var ptr1 = isLikeNone(palette)
      ? 0
      : passArray8ToWasm0(palette, wasm.__wbindgen_malloc);
    var len1 = WASM_VECTOR_LEN;
    var ptr2 = isLikeNone(trns)
      ? 0
      : passArray8ToWasm0(trns, wasm.__wbindgen_malloc);
    var len2 = WASM_VECTOR_LEN;
    wasm.encode(
      retptr,
      ptr0,
      len0,
      width,
      height,
      ptr1,
      len1,
      ptr2,
      len2,
      isLikeNone(color) ? 0xffffff : color,
      isLikeNone(depth) ? 0xffffff : depth,
      isLikeNone(compression) ? 0xffffff : compression,
      isLikeNone(filter) ? 0xffffff : filter
    );
    var r0 = getInt32Memory0()[retptr / 4 + 0];
    var r1 = getInt32Memory0()[retptr / 4 + 1];
    var v3 = getArrayU8FromWasm0(r0, r1).slice();
    wasm.__wbindgen_free(r0, r1 * 1);
    return v3;
  } finally {
    wasm.__wbindgen_add_to_stack_pointer(16);
  }
}

/**
 *
 * @param {Uint8Array} image
 * @param {number} width
 * @param {number} height
 * @param {object} options
 * @returns
 */
export function encode(image, width, height, options = {}) {
  if (options.stripAlpha) {
    image = image.filter((_, i) => (i + 1) % 4);
  }

  return wasmEncode(
    image,
    width,
    height,
    options.palette,
    options.trns,
    options.color ?? ColorType.RGBA,
    options.depth ?? BitDepth.Eight,
    options.compression,
    options.filter
  );
}

/**
 * @param {Uint8Array} image
 * @returns {any}
 */
export function wasmDecode(image) {
  var ptr0 = passArray8ToWasm0(image, wasm.__wbindgen_malloc);
  var len0 = WASM_VECTOR_LEN;
  var ret = wasm.decode(ptr0, len0);
  return takeObject(ret);
}

/**
 *
 * @param {Uint8Array} image
 * @returns {object}
 */
export function decode(image) {
  const res = wasmDecode(image);

  return {
    image: new Uint8Array(res.image),
    width: res.width,
    height: res.height,
    colorType: res.colorType,
    bitDepth: res.bitDepth,
    lineSize: res.lineSize
  };
}

/**
 */
export class DecodeResult {
  free() {
    const ptr = this.ptr;
    this.ptr = 0;

    wasm.__wbg_decoderesult_free(ptr);
  }
}

function __wbg_init_memory(imports, maybe_memory) {}

function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  __wbg_init.__wbindgen_wasm_module = module;

  return wasm;
}

function __wbg_get_imports() {
  const imports = {};
  imports.wbg = {};
  imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
    var ret = getStringFromWasm0(arg0, arg1);
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_json_parse = function (arg0, arg1) {
    var ret = JSON.parse(getStringFromWasm0(arg0, arg1));
    return addHeapObject(ret);
  };
  imports.wbg.__wbindgen_throw = function (arg0, arg1) {
    throw new Error(getStringFromWasm0(arg0, arg1));
  };
  imports.wbg.__wbindgen_rethrow = function (arg0) {
    throw takeObject(arg0);
  };
  return imports;
}

async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        if (module.headers.get("Content-Type") != "application/wasm") {
          console.warn(
            "`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
            e
          );
        } else {
          throw e;
        }
      }
    }

    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);

    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
}

function initSync(module) {
  if (wasm !== undefined) return wasm;

  const imports = __wbg_get_imports();

  __wbg_init_memory(imports);

  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }

  const instance = new WebAssembly.Instance(module, imports);

  return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
  if (wasm !== undefined) return wasm;

  if (typeof input === "undefined") {
    input = new URL("photon_rs_bg.wasm", import.meta.url);
  }
  const imports = __wbg_get_imports();

  if (
    typeof input === "string" ||
    (typeof Request === "function" && input instanceof Request) ||
    (typeof URL === "function" && input instanceof URL)
  ) {
    input = fetch(input);
  }

  __wbg_init_memory(imports);

  const { instance, module } = await __wbg_load(await input, imports);

  return __wbg_finalize_init(instance, module);
}

function initCloudflare() {
  return initSync(wasmModule);
}

export { initSync, initCloudflare, wasmModule as module };
export default __wbg_init;
