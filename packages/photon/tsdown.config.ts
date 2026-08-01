import * as cp from 'node:child_process';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { defineConfig, type UserConfig } from 'tsdown';

const LIB_CRATE_DIR = 'crate';
const LIB_NAME = 'photon_rs';
const LIB_OUT_DIR = 'src/lib';

export default defineConfig(async () => {
	const LIB_JS = path.join(LIB_OUT_DIR, `${LIB_NAME}.js`);
	const LIB_WASM = path.join(LIB_OUT_DIR, `${LIB_NAME}_bg.wasm`);

	if (!(await fsExists(LIB_JS)) || !(await fsExists(LIB_WASM))) {
		// Build wasm binaries and modules using wasm-pack
		cp.execSync(
			`wasm-pack build ${LIB_CRATE_DIR} --out-dir ${path.join('..', LIB_OUT_DIR)} --out-name ${LIB_NAME} --target web --no-pack`,
			{
				stdio: 'inherit',
			},
		);

		// Delete unnecessary files from output
		await Promise.all(
			[
				'package.json',
				'LICENSE',
				'LICENSE.md',
				'README',
				'README.md',
				'.gitignore',
			].map(async (file) => {
				const filePath = path.join(LIB_OUT_DIR, file);
				if (await fsExists(filePath)) {
					await fs.rm(filePath);
				}
			}),
		);

		// Make changes to out js to make it compatible for different environments
		const originalScript = await fs.readFile(LIB_JS, 'utf-8');
		const modifiedScript = originalScript
			.replace(
				'if (!(module instanceof WebAssembly.Module)) {\n        module = new WebAssembly.Module(module);\n    }',
				'//! Needed to remove these lines in order to make it work on next.js\n    // if (!(module instanceof WebAssembly.Module)) {\n    //     module = new WebAssembly.Module(module);\n    // }',
			)
			.replace(
				`if (typeof input === 'undefined') {\n        input = new URL('${LIB_NAME}_bg.wasm', import.meta.url);\n    }`,
				`//! Needed to remove these lines in order to make it work on node.js\n    // if (typeof input === 'undefined') {\n    //     input = new URL('${LIB_NAME}_bg.wasm', import.meta.url);\n    // }`,
			)
			.replace(
				`if (typeof module_or_path === 'undefined') {\n        module_or_path = new URL('${LIB_NAME}_bg.wasm', import.meta.url);\n    }`,
				`//! Needed to remove these lines in order to make it work on node.js\n    // if (typeof module_or_path === 'undefined') {\n    //     module_or_path = new URL('${LIB_NAME}_bg.wasm', import.meta.url);\n    // }`,
			)
			.replace(
				`if (module_or_path === undefined) {\n        module_or_path = new URL('${LIB_NAME}_bg.wasm', import.meta.url);\n    }`,
				`//! Needed to remove these lines in order to make it work on node.js\n    // if (typeof module_or_path === 'undefined') {\n    //     module_or_path = new URL('${LIB_NAME}_bg.wasm', import.meta.url);\n    // }`,
			);
		await fs.writeFile(LIB_JS, modifiedScript, 'utf-8');
	}

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
		platform: 'neutral',
		target: 'es2018',
		outDir: 'dist',
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

function fsExists(path: string): Promise<boolean> {
	return fs.access(path, fs.constants.F_OK).then(
		() => true,
		() => false,
	);
}
