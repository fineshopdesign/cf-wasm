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

/** Initializes satori */
export const initSatori = (input: InputParam) => {
  if (initSatori.input) {
    throw new Error('Function already called. The `initSatori()` function can be used only once.');
  }
  if (!input) {
    throw new Error('Invalid `input`. Provide valid `input`.');
  }
  initSatori.input = input;
};

/** The input provided through function */
initSatori.input = undefined as InputParam | undefined;
/** Indicates whether satori is initialized */
initSatori.initialized = false;

/** Ensures satori is initialized */
initSatori.ensure = async () => {
  if (!initSatori.input) {
    throw new Error('Satori is not yet initialized. Call `initSatori()` function first.');
  }
  if (!initSatori.initialized) {
    const input = await (typeof initSatori.input === 'function' ? initSatori.input() : initSatori.input);
    init(input);
    initSatori.initialized = true;
  }
};

export const satori = async (element: ReactNode | VNode, options: SatoriOptions) => {
  await initSatori.ensure();
  return (satoriWasm as (element: ReactNode | VNode, options: SatoriOptions) => Promise<string>)(element, options);
};

export type {
  Font,
  FontStyle,
  FontWeight,
  Locale,
  SatoriNode,
  SatoriOptions,
} from 'satori/wasm';
