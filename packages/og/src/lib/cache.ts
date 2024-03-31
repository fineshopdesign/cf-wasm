export const cacheInstances = new Map<string, Cache>();

export const getCache = async (name?: string) => {
	const cacheName = typeof name !== "undefined" ? name : getCache.default;
	let cache: Cache;

	if (typeof caches !== "undefined") {
		cache = cacheInstances.get(cacheName) || (await caches.open(cacheName));
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

	cacheInstances.set(cacheName, cache);
	return cache;
};

getCache.default = "cf-wasm-og-cache";
