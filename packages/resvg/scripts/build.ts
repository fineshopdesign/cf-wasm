import cp from 'node:child_process';
import path from 'node:path';
import clc from 'console-log-colors';
import type { Plugin } from 'esbuild';
import fs from 'fs-extra';
import * as glob from 'glob';
import { type Options, build } from 'tsup';

// Wasm
await import('./wasm');

// Entrypoints for ESM
const ESM_ENTRYPOINTS = glob.sync('./src/**/*.{ts,js}', {
  ignore: ['**/*.d.ts', './src/**/*.test.ts'],
});

// Entrypoints for CJS
const CJS_ENTRYPOINTS = glob.sync('./src/**/*.{ts,js}', {
  ignore: ['**/*.d.ts', './src/**/*.test.ts', './src/workers', './src/next'],
});

// Build directory
const OUT_DIR = 'dist';

// Common Build Options
const commonBuildOptions: Options = {
  outExtension: () => ({ js: '.js' }),
  splitting: false,
  // set bundle to true in order to use 'esbuild-plugin-file-path-extensions'
  bundle: true,
  clean: true,
  shims: true,
};

/** Adds extension to dist files */
export const addExtensionPlugin = (
  fileMap: { [FromExtenstion: string]: string } = {
    '.ts': '.js',
    '.js': '.js',
  },
): Plugin => ({
  name: 'add-extension',
  setup(build) {
    // eslint-disable-next-line consistent-return
    build.onResolve({ filter: /.*/ }, (args) => {
      if (args.importer) {
        const p = path.join(args.resolveDir, args.path);

        let importPath = '';

        for (const fromExtension in fileMap) {
          const toExtension = fileMap[fromExtension];
          let formPath = `${p}${fromExtension}`;
          if (fs.existsSync(formPath)) {
            importPath = args.path + toExtension;
          } else {
            formPath = path.join(args.resolveDir, args.path, `index${fromExtension}`);
            if (fs.existsSync(formPath)) {
              importPath = `${args.path}/index${toExtension}`;
            }
          }
        }

        return { path: importPath, external: true };
      }
    });
  },
});

// Build ESM
await build({
  ...commonBuildOptions,
  entry: ESM_ENTRYPOINTS,
  format: 'esm',
  outDir: `${OUT_DIR}/esm`,
  esbuildPlugins: [addExtensionPlugin()],
  tsconfig: fs.existsSync('tsconfig.esm.json') ? 'tsconfig.esm.json' : 'tsconfig.json',
});

// Build CJS
await build({
  ...commonBuildOptions,
  entry: CJS_ENTRYPOINTS,
  format: 'cjs',
  outDir: `${OUT_DIR}/cjs`,
  esbuildPlugins: [addExtensionPlugin()],
  tsconfig: fs.existsSync('tsconfig.cjs.json') ? 'tsconfig.cjs.json' : 'tsconfig.json',
});

// Build DTS
const dtsLog = clc.yellow('DTS');
console.log(`${dtsLog} Build start`);
cp.execSync(
  `tsc --project ${
    fs.existsSync('tsconfig.dts.json') ? 'tsconfig.dts.json' : 'tsconfig.dts.json'
  } --emitDeclarationOnly --declaration --outDir ${OUT_DIR}/dts`,
  {
    stdio: 'inherit',
  },
);
console.log(`${dtsLog} ⚡️ Build success`);

// Write package.json
const jsonLog = clc.magenta('JSON');
console.log(`${jsonLog} Write start`);
for (const [destination, object] of [
  [`./${OUT_DIR}/cjs/package.json`, { type: 'commonjs' }],
  [`./${OUT_DIR}/dts/package.json`, { type: 'commonjs' }],
  [`./${OUT_DIR}/esm/package.json`, { type: 'module' }],
] as const) {
  fs.writeJSONSync(destination, object, {
    encoding: 'utf8',
  });
}
console.log(`${jsonLog} ⚡️ Write success`);

// Copy files
const copyLog = clc.cyan('COPY');
console.log(`${copyLog} Copy start`);
const filesToCopy = glob.sync('./src/**/*.{wasm,bin}');
for (const filePath of filesToCopy) {
  const destinations = [`./${OUT_DIR}/esm`, `./${OUT_DIR}/cjs`].map((directory) => path.join(directory, filePath.replace(/^src[\\/]/, '')));
  for (const destination of destinations) {
    fs.copyFileSync(filePath, destination);
    console.log(`${copyLog}  ${clc.white(filePath)} => ${clc.white(destination)}`);
  }
}
console.log(`${copyLog} ⚡️ Copy success`);
