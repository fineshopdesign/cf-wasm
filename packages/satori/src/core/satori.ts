import type { ReactNode } from 'react';
import satoriWasm, { init, type SatoriOptions } from 'satori/wasm';
import type { Yoga } from 'yoga-wasm-web';

export type InputParam = (() => Yoga | Promise<Yoga>) | Yoga | Promise<Yoga>;

export interface VNode {
  type: string;
  props: {
    style?: Record<string, unknown>;
    children?: string | VNode | VNode[];
    [prop: string]: unknown;
  };
}

/** Initializes satori asynchronously */
export async function initSatori(input: Yoga | Promise<Yoga>) {
  if (initSatori.promise) {
    throw new Error('(@cf-wasm/satori): Function already called. The `initSatori()` function can be used only once.');
  }
  if (!input) {
    throw new Error('(@cf-wasm/satori): Argument `input` is not valid.');
  }
  initSatori.promise = (async () => {
    init(await input);
    initSatori.initialized = true;
  })();
  return initSatori.promise;
}

initSatori.promise = null as Promise<void> | null;
/** Indicates whether satori is initialized */
initSatori.initialized = false;

/** Ensures satori is initialized */
initSatori.ensure = async () => {
  if (!initSatori.promise) {
    throw new Error('(@cf-wasm/satori): Function not called. Call `initSatori()` function first.');
  }
  return initSatori.promise;
};

export async function satori(element: ReactNode | VNode, options: SatoriOptions) {
  await initSatori.ensure();
  return (satoriWasm as (element: ReactNode | VNode, options: SatoriOptions) => Promise<string>)(element, options);
}

export type {
  Font,
  FontStyle,
  FontWeight,
  Locale,
  SatoriNode,
  SatoriOptions,
} from 'satori/wasm';
