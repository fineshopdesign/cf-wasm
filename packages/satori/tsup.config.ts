import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as glob from 'glob';
import { defineConfig, type Options } from 'tsup';

const YOGA_WASM_LOCATION = fileURLToPath(import.meta.resolve('yoga-wasm-web/dist/yoga.wasm'));
const YOGA_WASM_DESTINATION = 'src/lib/yoga.wasm';

export default defineConfig(() => {
  fs.copyFileSync(YOGA_WASM_LOCATION, YOGA_WASM_DESTINATION);

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
