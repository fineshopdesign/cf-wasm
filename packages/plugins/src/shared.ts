import { cleanUrl } from './utils';

export const MODULE_TYPES = ['CompiledWasm', 'Data', 'Text'] as const;
export type ModuleType = (typeof MODULE_TYPES)[number];

export const moduleReferencePattern = '(?:\0|\\0)____CF_WASM:ADDITIONAL_MODULE__:(.*?):__CF_WASM:ADDITIONAL_MODULE____';
export const moduleReferenceRE = new RegExp(`^${moduleReferencePattern}$`);
export const moduleReferenceMatchGlobalRE = new RegExp(moduleReferencePattern, 'g');

export interface ModuleRule {
  type: ModuleType;
  extensions: string[];
}

export const moduleRules: ModuleRule[] = [
  { type: 'CompiledWasm', extensions: ['.wasm', '.wasm?module'] },
  { type: 'Data', extensions: ['.bin'] },
  { type: 'Text', extensions: ['.txt'] },
];

export const moduleExtensions = [...new Set(moduleRules.flatMap((r) => r.extensions.map((e) => cleanUrl(e))))];

export function matchModule(source: string) {
  for (const rule of moduleRules) {
    for (const ext of rule.extensions) {
      if (source.endsWith(ext)) {
        return {
          type: rule.type,
          extension: cleanUrl(ext),
        };
      }
    }
  }

  return null;
}

export function isModuleReference(id: string) {
  return moduleReferenceRE.test(id);
}

export function createModuleReference(key: string) {
  return `\0____CF_WASM:ADDITIONAL_MODULE__:${key}:__CF_WASM:ADDITIONAL_MODULE____`;
}

export type Target = 'inline' | 'node' | 'workerd' | 'edge-light';

export interface AdditionalModulesBaseOptions {
  /**
   * Sets the target environment
   *
   * `inline`: use inline base64 string
   *
   * `node`: use filesystem to read modules
   *
   * `workerd`: compatible with Cloudflare Workers, uses ESM import syntax for .{wasm|bin|txt}
   *
   * `edge-light`: compatible with Vercel Edge Functions and Cloudflare Workers, uses ESM import syntax for .wasm modules and inline modules for .{bin|txt}
   *
   * @default "workerd"
   *
   * @experimental
   */
  target?: Target;

  /**
   * Whether to delete files emitted during SSG and no longer needed
   *
   * @default true
   */
  cleanup?: boolean;
}
