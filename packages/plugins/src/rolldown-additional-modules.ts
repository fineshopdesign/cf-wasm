import type { Plugin } from 'rolldown';
import rollupPlugin, {
	type AdditionalModulesOptions as RollupPluginOptions,
} from './rollup-additional-modules';

export interface AdditionalModulesOptions extends RollupPluginOptions {}

export default function additionalModules(
	options: AdditionalModulesOptions = {},
): Plugin {
	const plugin = rollupPlugin(options) as Plugin;

	return {
		...plugin,

		name: 'cf-wasm:rolldown-plugin:additional-modules',
	};
}
