import type { Plugin } from 'vite';
import rollupPlugin, { type AdditionalModulesOptions as RollupPluginOptions } from './rollup-additional-modules';
import { type AdditionalModulesBaseOptions, moduleExtensions } from './shared';

export interface AdditionalModulesOptions extends AdditionalModulesBaseOptions {}

export default function additionalModules(options: AdditionalModulesOptions = {}): Plugin {
  const ctx: RollupPluginOptions = { ...options };
  const plugin = rollupPlugin(ctx) as Plugin;

  return {
    ...plugin,

    name: 'cf-wasm:vite-plugin:additional-modules',

    config() {
      return {
        assetsInclude: moduleExtensions.map((e) => `**/*${e}`),
      };
    },

    configResolved(config) {
      ctx.dev = config.command === 'serve';
      ctx.assetsDir = config.build.assetsDir;
    },
  };
}
