import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type UserConfig } from 'tsdown';

export default defineConfig(async () => {
	await fs.copyFile(
		fileURLToPath(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm')),
		'./src/lib/resvg.wasm',
	);
	await fs.copyFile(
		fileURLToPath(
			import.meta.resolve('@resvg/resvg-wasm-legacy/index_bg.wasm'),
		),
		'./src/legacy/lib/resvg.wasm',
	);

	// Generate inline modules
	await Promise.all(
		await Array.fromAsync(fs.glob('src/**/*.{wasm,bin,txt}'), async (file) => {
			const content = await fs.readFile(file);
			let module: string;
			let declaration: string;
			if (file.endsWith('.txt')) {
				module = `export default ${JSON.stringify(content.toString('utf-8'))}`;
				declaration = 'declare const string: string;\nexport default string;\n';
			} else {
				module = `const base64 = "${content.toString('base64')}";\nconst bytes = typeof Uint8Array.fromBase64 === 'function'\n  ? Uint8Array.fromBase64(base64)\n  : Uint8Array.from(atob(base64), c => c.charCodeAt(0));\nexport default bytes.buffer;\n`;
				declaration =
					'declare const buffer: ArrayBuffer;\nexport default buffer;\n';
			}
			await fs.writeFile(`${file}.inline.js`, module);
			await fs.writeFile(`${file}.inline.d.ts`, declaration);
		}),
	);

	return {
		entry: ['src/**/*.{js,ts}'],
		format: 'esm',
		outDir: 'dist',
		platform: 'neutral',
		target: 'es2018',
		sourcemap: true,
		unbundle: true,
		deps: {
			neverBundle: [/\.wasm$/, /\.wasm\?module$/, /\.bin$/, /\.txt$/],
		},
		dts: true,
		clean: true,
		ignoreWatch: ['.turbo'],
		async onSuccess() {
			// Copy assets
			await Promise.all(
				await Array.fromAsync(
					fs.glob('src/**/*.{wasm,bin,txt}'),
					async (file) => {
						const destination = path.join(
							'dist',
							file.replace(/^src[\\/]/, ''),
						);
						await fs.mkdir(path.dirname(destination), { recursive: true });
						await fs.copyFile(file, destination);
					},
				),
			);
		},
	} satisfies UserConfig;
});
