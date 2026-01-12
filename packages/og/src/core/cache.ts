import { ASSET_CACHE_MAP, EMOJI_CACHE_MAP, FONT_CACHE_MAP } from './maps';
import type { MayBePromise } from './types';

/** The execution context interface */
export interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
}

/** Cache instance map */
export const CACHE_INSTANCE_MAP = new Map<string, Cache>();

/** A Cache like no-op object */
export const CACHE_INTERFACE: Cache = {
  add: () => Promise.resolve(),
  addAll: () => Promise.resolve(),
  delete: () => Promise.resolve(false),
  keys: () => Promise.resolve([]),
  match: () => Promise.resolve(undefined),
  matchAll: () => Promise.resolve([]),
  put: () => Promise.resolve(),
};

/**
 * An interface representing options for `cache.serve` method
 */
export interface ServeCacheOptions<K extends RequestInfo | URL> {
  /**
   * The {@link Cache} to use if provided, otherwise uses default
   */
  cache?: Cache;

  /**
   * Preserve headers from response headers being removed
   */
  preserveHeaders?: string[] | ((headerKey: string, headerValue: string, response: Response, cacheStore: Cache, cacheKey: K) => boolean) | boolean;

  /**
   * Indicates whether `Cache-Control should be overwritten`.
   * It also can be a string representing the header value
   *
   * @default true
   */
  overwriteCacheControl?: string | boolean;
}

/** Cache utils */
class CacheUtils {
  /** Indicates whether cache is enabled */
  private _enabled = true;

  /**
   * Indicates whether {@link Cache} api is supported
   * in current environment or not
   */
  get supported() {
    return typeof caches !== 'undefined';
  }

  /**
   * The {@link Cache} instance or a
   * string representing the name of {@link Cache} to be opened
   */
  store: string | Cache = 'cf-wasm-og-cache';

  /**
   * The `Cache-Control` header to set for asset responses for caching
   *
   * @default 'public, max-age=604800, s-maxage=43200'
   */
  cacheControlHeader = 'public, max-age=604800, s-maxage=43200';

  /** The waitUntil function */
  private _waitUntil?: (promise: Promise<unknown>) => void;

  /** Enables cache */
  enable() {
    this._enabled = true;
  }

  /** Disables cache */
  disable() {
    this._enabled = false;
  }

  /**
   * Sets execution context
   *
   * Example for Cloudflare workers:
   *
   * ```ts
   * import { cache } from "@cf-wasm/og";
   *
   * export interface Env {}
   *
   * export default {
   *   fetch(req: Request, env: Env, ctx: ExecutionContext) {
   *     cache.setExecutionContext(ctx);
   *
   *     // ...
   *   }
   * }
   * ```
   */
  setExecutionContext(ctx: ExecutionContext) {
    if (typeof ctx?.waitUntil !== 'function') {
      throw new TypeError('Provided object is not an execution context object.');
    }
    this._waitUntil = (promise) => ctx.waitUntil(promise);
  }

  /**
   * Opens a cache
   *
   * @param cacheName If provided, the name of cache to be opened
   *
   * @returns A promise which resolves to {@link Cache}
   */
  async open(cacheName?: string): Promise<Cache> {
    if (typeof this.store === 'object') {
      return this.store;
    }
    const name = typeof cacheName === 'string' ? cacheName : this.store;
    const store = this.supported ? (CACHE_INSTANCE_MAP.get(name) ?? (await caches.open(name))) : CACHE_INTERFACE;
    CACHE_INSTANCE_MAP.set(name, store);
    return store;
  }

  /**
   * Serve cached assets
   *
   * @param key The cache key
   * @param fallback The fallback function which provides the {@link Response} when cache key is not matched
   * @param param2 Options
   *
   * @returns A promise which resolves to {@link Response}
   */
  async serve<K extends RequestInfo | URL, F extends (cacheKey: K, cacheStore: Cache) => MayBePromise<Response | undefined>>(
    key: K,
    fallback: F,
    { cache: cacheStore, preserveHeaders, overwriteCacheControl = true }: ServeCacheOptions<K> = {},
  ): Promise<Awaited<ReturnType<F>>> {
    const store = cacheStore ?? (await this.open());

    let response: Response | undefined;

    if (!this._enabled || !this.supported || !this._waitUntil) {
      const fallbackResponse = await fallback(key, store);

      if (fallbackResponse instanceof Response) {
        response = new Response(fallbackResponse.body, fallbackResponse);
      }
    } else {
      response = await store.match(key).then((res) => (res?.ok ? res : undefined));

      if (!response) {
        const fallbackResponse = await fallback(key, store);

        if (fallbackResponse instanceof Response) {
          response = new Response(fallbackResponse.body, fallbackResponse);

          if (preserveHeaders !== true) {
            response.headers.forEach((value, _key) => {
              if (preserveHeaders === false) {
                response?.headers.delete(_key);
              } else if (typeof preserveHeaders === 'function' && !preserveHeaders(_key, value, response as Response, store, key)) {
                response?.headers.delete(_key);
              } else {
                const preservedHeaders = (Array.isArray(preserveHeaders) ? preserveHeaders : ['content-type', 'cache-control']).map((e) =>
                  e.toLowerCase(),
                );
                if (!preservedHeaders.includes(_key.toLowerCase())) {
                  response?.headers.delete(_key);
                }
              }
            });
          }

          if (overwriteCacheControl === true || typeof overwriteCacheControl === 'string' || !response.headers.has('Cache-Control')) {
            response.headers.set('Cache-Control', typeof overwriteCacheControl === 'string' ? overwriteCacheControl : this.cacheControlHeader);
          }

          const promise = store.put(key, response.clone());
          this._waitUntil(promise);
        }
      } else {
        response = new Response(response.body, response);
      }
    }

    return response as unknown as Promise<Awaited<ReturnType<F>>>;
  }

  clearMaps() {
    ASSET_CACHE_MAP.clear();
    CACHE_INSTANCE_MAP.clear();
    EMOJI_CACHE_MAP.clear();
    FONT_CACHE_MAP.clear();
  }
}

export const cache = new CacheUtils();
