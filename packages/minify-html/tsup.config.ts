import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as glob from 'glob';
import { defineConfig, type Options } from 'tsup';

const MINIFY_HTML_DTS = `export function __wbg_set_wasm(exports: WebAssembly.Exports): void;

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

export default defineConfig(() => {
  fs.copyFileSync(fileURLToPath(import.meta.resolve('@minify-html/wasm/index_bg.js')), './src/lib/index_bg.js');
  fs.copyFileSync(fileURLToPath(import.meta.resolve('@minify-html/wasm/index_bg.wasm')), './src/lib/index_bg.wasm');
  fs.writeFileSync('./src/lib/index_bg.d.ts', MINIFY_HTML_DTS);
  fs.writeFileSync('./src/lib/index_bg.wasm.d.ts', 'declare const module: WebAssembly.Module;\nexport default module;\n');

  // generate inline modules
  for (const file of glob.sync('src/**/*.{wasm,bin,txt}')) {
    const content = fs.readFileSync(file);
    let module: string;
    let declaration: string;
    if (file.endsWith('.wasm')) {
      module = `export default new WebAssembly.Module(Uint8Array.from(atob("${content.toString('base64')}"), c => c.charCodeAt(0)));\n`;
      declaration = 'declare const module: WebAssembly.Module;\nexport default module;\n';
    } else if (file.endsWith('.txt')) {
      module = `export default ${JSON.stringify(content.toString('utf-8'))}`;
      declaration = 'declare const string: string;\nexport default string;\n';
    } else {
      module = `export default Uint8Array.from(atob("${content.toString('base64')}"), c => c.charCodeAt(0)).buffer;\n`;
      declaration = 'declare const buffer: ArrayBuffer;\nexport default buffer;\n';
    }
    fs.writeFileSync(`${file}.inline.js`, module);
    fs.writeFileSync(`${file}.inline.d.ts`, declaration);
  }

  const commonOptions = {
    outDir: 'dist',
    platform: 'neutral',
    sourcemap: true,
    splitting: true,
    shims: true,
    dts: true,
  } satisfies Options;

  return [
    {
      ...commonOptions,
      entry: ['src/edge-light.ts', 'src/node.ts', 'src/others.ts', 'src/workerd.ts'],
      format: ['esm'],
      external: [/\.wasm$/, /\.wasm\?module$/, /\.bin$/, /\.txt$/],
      clean: true,
      async onSuccess() {
        // Copy assets
        const assets = glob.sync('src/**/*.{wasm,bin,txt}');
        for (const file of assets) {
          const destination = path.join('dist', file.replace(/^src[\\/]/, ''));
          const dir = path.dirname(destination);
          if (fs.existsSync(destination)) {
            continue;
          }
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          fs.copyFileSync(file, destination);
        }
      },
    },
    {
      ...commonOptions,
      entry: ['src/node.ts', 'src/others.ts'],
      format: ['cjs'],
    },
  ];
});
