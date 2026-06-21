import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: ['src/**/*.ts'],
	format: ['esm', 'cjs'],
	platform: 'neutral',
	target: 'es2018',
	outDir: 'dist',
	sourcemap: true,
	unbundle: true,
	deps: {
		skipNodeModulesBundle: true,
	},
	dts: true,
	clean: true,
	ignoreWatch: ['.turbo'],
});
