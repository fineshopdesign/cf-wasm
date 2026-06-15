import type { SatoriOptions, VNode } from '@cf-wasm/satori';
import type { ReactNode } from 'react';
import { modules } from './modules';

export function satori(element: ReactNode | VNode, options: SatoriOptions): Promise<string> {
  return modules.satori.satori(element, options);
}

export type { Font, FontStyle, FontWeight, Locale, SatoriNode, SatoriOptions, VNode } from '@cf-wasm/satori';
