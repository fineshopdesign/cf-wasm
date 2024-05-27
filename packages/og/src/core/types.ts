/** utils types */
export type MayBePromise<T> = T | Promise<T>;

export type OnlyProps<T, P> = {
  [K in keyof T as K extends P ? K : never]: T[K];
};

// permits `string` but gives hints
export type StringWithSuggestions<S extends string> = (string & Record<never, never>) | S;
