import initAsync, { type InitInput } from "../png";

export const initPng = async (input: InitInput | Promise<InitInput>) => {
	if (initPng.initialized) {
		throw new Error(
			"Already initialized. The `initPng()` function can be used only once."
		);
	}
	await initAsync(input);
};

initPng.initialized = false;

export { initAsync };
export * from "../png";
