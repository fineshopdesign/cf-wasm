export const cacheInstances = new Map<string, Cache>();

export const getCache = async (name: string = "cf-wasm-og-cache") => {
	let cache: Cache;
	if (typeof caches !== "undefined") {
		cache = cacheInstances.get(name) || (await caches.open(name));
	} else {
		cache = {
			async add() {
				return Promise.resolve(undefined);
			},
			async addAll() {
				return Promise.resolve(undefined);
			},
			async delete() {
				return Promise.resolve(false);
			},
			async keys() {
				return Promise.resolve([]);
			},
			async match() {
				return Promise.resolve(undefined);
			},
			async matchAll() {
				return Promise.resolve([]);
			},
			async put() {
				return Promise.resolve(undefined);
			}
		};
	}
	cacheInstances.set(name, cache);
	return cache;
};
