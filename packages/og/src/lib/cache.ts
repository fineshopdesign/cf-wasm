export const cacheInstances = new Map<string, Cache>();

// A Cache like no-op object
export const cacheInterface: Cache = {
	add: () => Promise.resolve(),
	addAll: () => Promise.resolve(),
	delete: () => Promise.resolve(false),
	keys: () => Promise.resolve([]),
	match: () => Promise.resolve(undefined),
	matchAll: () => Promise.resolve([]),
	put: () => Promise.resolve()
};

export const cache = {
	/**
	 * Indicates whether {@link Cache} api is supported
	 * in current environment or not
	 */
	get supported() {
		return typeof caches !== "undefined";
	},

	/**
	 * The {@link Cache} instance or a
	 * string representing the name of {@link Cache} to be opened
	 */
	store: "cf-wasm-og-cache" as string | Cache,

	/**
	 * The `Cache-Control` header to set for asset responses for caching
	 */
	cacheControlHeader: "public, max-age=604800, s-maxage=43200",

	/**
	 * The `waitUntil` function
	 *
	 * Note that if you are overwriting this function,
	 * you should not do the following:
	 * ```ts
	 * <Object>.waitUntil = ctx.waitUntil // here ctx is cloudflare workers' executionContext
	 * ```
	 *
	 * Instead write it as following:
	 * ```ts
	 * <Object>.waitUntil = ctx.waitUntil.bind(ctx) // here ctx is cloudflare workers' executionContext
	 * ```
	 */
	waitUntil: (async (promise) => {
		await promise;
	}) as ((promise: Promise<unknown>) => void | Promise<void>) | undefined,

	/**
	 * Opens a cache
	 *
	 * @param cacheName If provided, the name of cache to be opened
	 *
	 * @returns A promise which resolves to {@link Cache}
	 */
	async open(cacheName?: string) {
		if (typeof this.store === "object") {
			return this.store;
		}
		const name = typeof cacheName === "string" ? cacheName : this.store;
		const store = this.supported
			? cacheInstances.get(name) || (await caches.open(name))
			: cacheInterface;
		cacheInstances.set(name, store);
		return store;
	},

	/**
	 * Serve cached assets
	 *
	 * @param key The cache key
	 * @param fallback The fallback function which provides the {@link Response} when cache key is not matched
	 * @param param2 Options
	 *
	 * @returns A promise which resolves to {@link Response}
	 */
	async serve<
		K extends RequestInfo | URL,
		F extends (
			_cacheKey: K,
			_cacheStore: Cache
		) => Response | Promise<Response | undefined | void> | undefined | void
	>(
		key: K,
		fallback: F,
		{
			cache: cacheStore,
			preserveHeaders,
			overwriteCacheControl = true
		}: {
			cache?: Cache;
			preserveHeaders?:
				| string[]
				| ((
						_headerKey: string,
						_headerValue: string,
						_response: Response,
						_cacheStore: Cache,
						_cacheKey: K
				  ) => boolean)
				| boolean;
			overwriteCacheControl?: string | boolean;
		} = {}
	): Promise<Awaited<ReturnType<F>>> {
		const store = cacheStore ?? (await this.open());

		let response: Response | undefined | void = await store
			.match(key)
			.then((res) => (res?.ok ? res : undefined));

		if (!response) {
			const fallbackResponse = await fallback(key, store);

			if (fallbackResponse instanceof Response) {
				response = new Response(fallbackResponse.body, fallbackResponse);

				if (preserveHeaders !== true) {
					response.headers.forEach((value, _key) => {
						if (preserveHeaders === false) {
							response!.headers.delete(_key);
						} else if (
							typeof preserveHeaders === "function" &&
							!preserveHeaders(_key, value, response!, store, key)
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
					overwriteCacheControl === true ||
					typeof overwriteCacheControl === "string" ||
					!response.headers.has("Cache-Control")
				) {
					response.headers.set(
						"Cache-Control",
						typeof overwriteCacheControl === "string"
							? overwriteCacheControl
							: this.cacheControlHeader
					);
				}

				const promise = store.put(key, response.clone());
				if (this.waitUntil) {
					await this.waitUntil(promise);
				} else {
					promise.catch((e) => console.error(e));
				}
			}
		} else {
			response = new Response(response.body, response);
		}

		return response as unknown as Promise<Awaited<ReturnType<F>>>;
	}
};
