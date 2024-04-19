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
getCache.cacheControlHeader = "public, max-age=604800, s-maxage=43200";

export const cachedAssetResponse = async <K extends RequestInfo | URL>(
	key: K,
	fallback: (cacheKey: K, cacheStore: Cache) => Response | Promise<Response>,
	{
		cache,
		preserveHeaders,
		overwriteCacheControl = getCache.cacheControlHeader
	}: {
		cache?: Cache;
		preserveHeaders?:
			| string[]
			| ((
					headerKey: string,
					headerValue: string,
					response: Response,
					cacheStore: Cache,
					cacheKey: K
			  ) => boolean)
			| boolean;
		overwriteCacheControl?: string;
	} = {}
) => {
	const cacheStore = cache ?? (await getCache());

	let response = await cacheStore
		.match(key)
		.then((res) => (res?.ok ? res : undefined));

	if (!response) {
		const fallbackResponse = await fallback(key, cacheStore);

		if (!(fallbackResponse instanceof Response)) {
			throw new Error(
				"fallback function must return either Response or Promise<Response>"
			);
		}

		response = new Response(fallbackResponse.body, fallbackResponse);

		if (preserveHeaders !== true) {
			response.headers.forEach((value, _key) => {
				if (preserveHeaders === false) {
					response!.headers.delete(_key);
				} else if (
					typeof preserveHeaders === "function" &&
					!preserveHeaders(_key, value, response!, cacheStore, key)
				) {
					response!.headers.delete(_key);
				} else {
					const preservedHeaders = (
						Array.isArray(preserveHeaders)
							? preserveHeaders
							: ["content-type", "cache-control"]
					).map((e) => e.toLowerCase());
					if (!preservedHeaders.includes(_key.toLowerCase())) {
						response!.headers.delete(_key);
					}
				}
			});
		}

		if (
			typeof overwriteCacheControl === "string" ||
			!response.headers.has("Cache-Control")
		) {
			response.headers.set("Cache-Control", overwriteCacheControl);
		}

		await cacheStore.put(key, response.clone());
	}

	return response;
};
