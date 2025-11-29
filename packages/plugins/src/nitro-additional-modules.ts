import type { NitroModule, RollupConfig } from 'nitro/types';
import rollupPlugin from './rollup-additional-modules';
import type { AdditionalModulesBaseOptions } from './shared';

export interface AdditionalModules extends AdditionalModulesBaseOptions {}

export default function additionalModules(options: AdditionalModules = {}) {
  return {
    name: 'cf-wasm:nitro-module:additional-modules',
    setup({ options: nitroOptions }) {
      nitroOptions.rollupConfig ??= {} as RollupConfig;
      nitroOptions.rollupConfig.plugins ??= [];
      nitroOptions.rollupConfig.plugins = [
        ...(Array.isArray(nitroOptions.rollupConfig.plugins) ? nitroOptions.rollupConfig.plugins : [nitroOptions.rollupConfig.plugins]),
        rollupPlugin({
          ...options,
          dev: nitroOptions.dev,
        }),
      ];
    },
  } satisfies NitroModule;
}
