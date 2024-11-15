import cp from 'node:child_process';
import path from 'node:path';
import fs from 'fs-extra';

const CRATE_DIR = 'crate';
const LIB_NAME = 'png';
const OUT_DIR = 'src/lib';

// Build wasm binaries and modules using wasm-pack
cp.execSync(`wasm-pack build ${CRATE_DIR} --out-dir ${path.join('..', OUT_DIR)} --out-name ${LIB_NAME} --target web`, {
  stdio: 'inherit',
});

// Delete unnecessary files from output
for (const file of ['package.json', 'LICENSE', 'LICENSE.md', 'README', 'README.md', '.gitignore']) {
  fs.rmSync(path.join(OUT_DIR, file), { force: true });
}

// Make changes to out js to make it compatible
// for different environments
const jsOutFile = path.join(OUT_DIR, `${LIB_NAME}.js`);

const originalScript = fs.readFileSync(jsOutFile, 'utf-8');

const modifiedScript = originalScript
  .replace(
    `if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }`,
    `//! Needed to remove these lines in order to make it work on next.js
    // if (!(module instanceof WebAssembly.Module)) {
    //     module = new WebAssembly.Module(module);
    // }`,
  )
  .replace(
    `if (typeof input === 'undefined') {
        input = new URL('${LIB_NAME}_bg.wasm', import.meta.url);
    }`,
    `//! Needed to remove these lines in order to make it work on node.js
    // if (typeof input === 'undefined') {
    //     input = new URL('${LIB_NAME}_bg.wasm', import.meta.url);
    // }`,
  )
  .replace(
    `if (typeof module_or_path === 'undefined') {
        module_or_path = new URL('${LIB_NAME}_bg.wasm', import.meta.url);
    }`,
    `//! Needed to remove these lines in order to make it work on node.js
    // if (typeof module_or_path === 'undefined') {
    //     module_or_path = new URL('${LIB_NAME}_bg.wasm', import.meta.url);
    // }`,
  );

fs.writeFileSync(jsOutFile, modifiedScript, 'utf-8');
