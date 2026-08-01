import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type UserConfig } from 'tsdown';

export default defineConfig(async () => {
	await fs.copyFile(
		fileURLToPath(import.meta.resolve('@minify-html/wasm/index_bg.js')),
		'./src/lib/index_bg.js',
	);
	await fs.copyFile(
		fileURLToPath(import.meta.resolve('@minify-html/wasm/index_bg.wasm')),
		'./src/lib/index_bg.wasm',
	);
	await fs.writeFile('./src/lib/index_bg.d.ts', getMinifyHtmlDts());
	await fs.writeFile(
		'./src/lib/index_bg.wasm.d.ts',
		'declare const module: WebAssembly.Module;\nexport default module;\n',
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

function getMinifyHtmlDts(): string {
	return `export function __wbg_set_wasm(exports: WebAssembly.Exports): void;

/**
 * Configuration settings that can be adjusted and passed to a minification function to change the
 * minification approach.
 */
export interface MinifyOptions {
  /**
   * Allow unquoted attribute values in the output to contain characters prohibited by the
   * [WHATWG specification](https://html.spec.whatwg.org/multipage/syntax.html#attributes-2).
   * These will still be parsed correctly by almost all browsers.
   */
  allow_noncompliant_unquoted_attribute_values?: boolean;

  /**
   * Allow some minifications around entities that may not pass validation,
   * but will still be parsed correctly by almost all browsers.
   */
  allow_optimal_entities?: boolean;

  /**
   * Allow removing_spaces between attributes when possible, which may not be spec compliant.
   * These will still be parsed correctly by almost all browsers.
   */
  allow_removing_spaces_between_attributes?: boolean;

  /** Do not omit closing tags when possible. */
  keep_closing_tags?: boolean;

  /** Keep all comments. */
  keep_comments?: boolean;

  /** Do not omit \`<html>\` and \`<head>\` opening tags when they don't have attributes. */
  keep_html_and_head_opening_tags?: boolean;

  /** Keep \`type=text\` attribute name and value on \`<input>\` elements. */
  keep_input_type_text_attr?: boolean;

  /** Keep SSI comments. */
  keep_ssi_comments?: boolean;

  /** Minify CSS in \`<style>\` tags and \`style\` attributes using [https://github.com/parcel-bundler/lightningcss](lightningcss). */
  minify_css?: boolean;

  /** Minify DOCTYPEs. Minified DOCTYPEs may not be spec compliant, but will still be parsed correctly by almost all browsers. */
  minify_doctype?: boolean;

  /** Minify JavaScript in \`<script>\` tags using [minify-js](https://github.com/wilsonzlin/minify-js). */
  minify_js?: boolean;

  /**
   * When \`{{\`, \`{#\`, or \`{%\` are seen in content, all source code until the subsequent
   * matching closing \`}}\`, \`#}\`, or \`%}\` respectively gets piped through untouched.
   */
  preserve_brace_template_syntax?: boolean;

  /**
   * When \`<%\` is seen in content, all source code until the subsequent matching closing \`%>\`
   * gets piped through untouched.
   */
  preserve_chevron_percent_template_syntax?: boolean;

  /** Remove all bangs. */
  remove_bangs?: boolean;

  /** Remove all processing instructions. */
  remove_processing_instructions?: boolean;
}

export function minify(code: Uint8Array, cfg: MinifyOptions): Uint8Array;
`;
}
