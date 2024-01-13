let wasm;

const cachedTextDecoder =
	typeof TextDecoder !== "undefined"
		? new TextDecoder("utf-8", { ignoreBOM: true, fatal: true })
		: {
				decode: () => {
					throw Error("TextDecoder not available");
				}
			};

if (typeof TextDecoder !== "undefined") {
	cachedTextDecoder.decode();
}

let cachedUint8Memory0 = null;

function getUint8Memory0() {
	if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
		cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
	}
	return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
	ptr = ptr >>> 0;
	return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(128).fill(undefined);

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
	if (idx < 132) return;
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
	const ptr = malloc(arg.length * 1, 1) >>> 0;
	getUint8Memory0().set(arg, ptr / 1);
	WASM_VECTOR_LEN = arg.length;
	return ptr;
}

function isLikeNone(x) {
	return x === undefined || x === null;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
	if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
		cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
	}
	return cachedInt32Memory0;
}

function getArrayU8FromWasm0(ptr, len) {
	ptr = ptr >>> 0;
	return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
 * @param {Uint8Array} image
 * @param {number} width
 * @param {number} height
 * @param {Uint8Array | undefined} [palette]
 * @param {Uint8Array | undefined} [trns]
 * @param {number | undefined} [color]
 * @param {number | undefined} [depth]
 * @param {number | undefined} [compression]
 * @param {number | undefined} [filter]
 * @returns {Uint8Array}
 */
export function encode(
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
		const ptr0 = passArray8ToWasm0(image, wasm.__wbindgen_malloc);
		const len0 = WASM_VECTOR_LEN;
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
		var r2 = getInt32Memory0()[retptr / 4 + 2];
		var r3 = getInt32Memory0()[retptr / 4 + 3];
		if (r3) {
			throw takeObject(r2);
		}
		var v4 = getArrayU8FromWasm0(r0, r1).slice();
		wasm.__wbindgen_free(r0, r1 * 1, 1);
		return v4;
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 * @param {Uint8Array} image
 * @returns {any}
 */
export function decode(image) {
	try {
		const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
		const ptr0 = passArray8ToWasm0(image, wasm.__wbindgen_malloc);
		const len0 = WASM_VECTOR_LEN;
		wasm.decode(retptr, ptr0, len0);
		var r0 = getInt32Memory0()[retptr / 4 + 0];
		var r1 = getInt32Memory0()[retptr / 4 + 1];
		var r2 = getInt32Memory0()[retptr / 4 + 2];
		if (r2) {
			throw takeObject(r1);
		}
		return takeObject(r0);
	} finally {
		wasm.__wbindgen_add_to_stack_pointer(16);
	}
}

/**
 */
export class DecodeResult {
	__destroy_into_raw() {
		const ptr = this.__wbg_ptr;
		this.__wbg_ptr = 0;

		return ptr;
	}

	free() {
		const ptr = this.__destroy_into_raw();
		wasm.__wbg_decoderesult_free(ptr);
	}
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

function __wbg_get_imports() {
	const imports = {};
	imports.wbg = {};
	imports.wbg.__wbindgen_string_new = function (arg0, arg1) {
		const ret = getStringFromWasm0(arg0, arg1);
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_new_c728d68b8b34487e = function () {
		const ret = new Object();
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_new_08236689f0afb357 = function () {
		const ret = new Array();
		return addHeapObject(ret);
	};
	imports.wbg.__wbindgen_number_new = function (arg0) {
		const ret = arg0;
		return addHeapObject(ret);
	};
	imports.wbg.__wbg_set_0ac78a2bc07da03c = function (arg0, arg1, arg2) {
		getObject(arg0)[arg1 >>> 0] = takeObject(arg2);
	};
	imports.wbg.__wbg_set_20cbc34131e76824 = function (arg0, arg1, arg2) {
		getObject(arg0)[takeObject(arg1)] = takeObject(arg2);
	};
	imports.wbg.__wbindgen_object_clone_ref = function (arg0) {
		const ret = getObject(arg0);
		return addHeapObject(ret);
	};
	imports.wbg.__wbindgen_throw = function (arg0, arg1) {
		throw new Error(getStringFromWasm0(arg0, arg1));
	};

	return imports;
}

function __wbg_init_memory(imports, maybe_memory) {}

function __wbg_finalize_init(instance, module) {
	wasm = instance.exports;
	__wbg_init.__wbindgen_wasm_module = module;
	cachedInt32Memory0 = null;
	cachedUint8Memory0 = null;

	return wasm;
}

function initSync(module) {
	if (wasm !== undefined) return wasm;

	const imports = __wbg_get_imports();

	__wbg_init_memory(imports);

	// ! Needed to remove these lines in order to make it work on next.js
	// if (!(module instanceof WebAssembly.Module)) {
	//     module = new WebAssembly.Module(module);
	// }

	const instance = new WebAssembly.Instance(module, imports);

	return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
	if (wasm !== undefined) return wasm;

	// ! Needed to remove it for Common JS
	// if (typeof input === "undefined") {
	// 	input = new URL("png_bg.wasm", import.meta.url);
	// }
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

export { initSync };
export default __wbg_init;
