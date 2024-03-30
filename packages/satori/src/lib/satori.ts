import satoriWasm, {
	init as initSatori,
	type SatoriOptions
} from "satori/wasm";

export const init = (input: unknown) => {
	if (init.called) {
		throw new Error("init() can be called only once");
	}
	init.called = true;
	init.input = input;
};
init.called = false;
init.input = undefined as unknown;

export const ensureInit = async () => {
	if (!init.called) {
		throw new Error("Call init() first");
	}
	if (!init.input) {
		throw new Error("Input provided using init() is not valid");
	}
	if (!ensureInit.initialized) {
		const yoga = (
			init.input instanceof Promise ? await init.input : init.input
		) as never;
		initSatori(yoga);
		ensureInit.initialized = true;
	}
};

ensureInit.initialized = false;

export const satori = async (
	element: React.ReactNode,
	options: SatoriOptions
) => {
	await ensureInit();
	return satoriWasm(element, options);
};

export {
	type Font,
	type FontStyle,
	type FontWeight,
	type Locale,
	type SatoriNode,
	type SatoriOptions
} from "satori/wasm";
