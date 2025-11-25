import * as cp from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as glob from 'glob';
import { defineConfig, type Options } from 'tsup';

const LIB_CRATE_DIR = 'crate';
const LIB_NAME = 'png';
const LIB_OUT_DIR = 'src/lib';

export default defineConfig(() => {
  const LIB_JS = path.join(LIB_OUT_DIR, `${LIB_NAME}.js`);
  const LIB_WASM = path.join(LIB_OUT_DIR, `${LIB_NAME}_bg.wasm`);

  if (!fs.existsSync(LIB_JS) || !fs.existsSync(LIB_WASM)) {
    // Build wasm binaries and modules using wasm-pack
    cp.execSync(`wasm-pack build ${LIB_CRATE_DIR} --out-dir ${path.join('..', LIB_OUT_DIR)} --out-name ${LIB_NAME} --target web --no-pack`, {
      stdio: 'inherit',
    });

    // Delete unnecessary files from output
    for (const file of ['package.json', 'LICENSE', 'LICENSE.md', 'README', 'README.md', '.gitignore']) {
      const filePath = path.join(LIB_OUT_DIR, file);
      if (fs.existsSync(filePath)) {
        fs.rmSync(filePath);
      }
    }

    // Make changes to out js to make it compatible for different environments
    const originalScript = fs.readFileSync(LIB_JS, 'utf-8');
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
      );
    fs.writeFileSync(LIB_JS, modifiedScript, 'utf-8');
  }

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
