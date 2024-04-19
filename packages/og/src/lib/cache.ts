export const cacheInstances = new Map<string, Cache>();

export const getCache = async (name?: string) => {
	const cacheName = typeof name !== "undefined" ? name : getCache.default;
	let cache: Cache;

	if (typeof caches !== "undefined") {
		cache = cacheInstances.get(cacheName) || (await caches.open(cacheName));
	} else {
		cache = {
			add: () => Promise.resolve(),
			addAll: () => Promise.resolve(),
			delete: () => Promise.resolve(false),
			keys: () => Promise.resolve([]),
			match: () => Promise.resolve(undefined),
			matchAll: () => Promise.resolve([]),
			put: () => Promise.resolve()
		};
	}

	cacheInstances.set(cacheName, cache);
	return cache;
};

getCache.default = "cf-wasm-og-cache";
