import { defineConfig } from 'tsdown';

export default defineConfig({
	entry: ['src/**/*.{js,ts}'],
	format: 'esm',
	platform: 'neutral',
	target: 'es2018',
	outDir: 'dist',
	sourcemap: true,
	unbundle: true,
	deps: {
		neverBundle: true,
	},
	dts: true,
	clean: true,
	ignoreWatch: ['.turbo'],
});
