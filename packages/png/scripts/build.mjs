import cp from "node:child_process";
import path from "node:path";
import fs from "node:fs";

import buildConfig from "./config.mjs";

const startedOn = Date.now();

// Clean out dir
console.log("⚡ Cleaning dist dir...");
fs.rmSync("dist", { recursive: true, force: true });

// Delete unnecessary files from output
[
	"package.json",
	"LICENSE",
	"LICENSE.md",
	"README",
	"README.md",
	".gitignore"
].forEach((file) =>
	fs.rmSync(path.join(buildConfig.wasm.out, file), { force: true })
);

// Make changes to out js to make it compatible
// for different environments
const jsOutFile = path.join(
	buildConfig.wasm.out,
	`${buildConfig.wasm.name}.js`
);

const originalScript = fs.readFileSync(jsOutFile, "utf-8");

const modifiedScript = originalScript
	.replace(
		`if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }`,
		`//! Needed to remove these lines in order to make it work on next.js
    // if (!(module instanceof WebAssembly.Module)) {
    //     module = new WebAssembly.Module(module);
    // }`
	)
	.replace(
		`if (typeof input === 'undefined') {
        input = new URL('${buildConfig.wasm.name}_bg.wasm', import.meta.url);
    }`,
		`//! Needed to remove these lines in order to make it work on node.js
    // if (typeof input === 'undefined') {
    //     input = new URL('${buildConfig.wasm.name}_bg.wasm', import.meta.url);
    // }`
	);

fs.writeFileSync(jsOutFile, modifiedScript, "utf-8");

// Build ESM
console.log("⚡ Building ESM...");
cp.execSync(
	["pnpm tsc", "pnpm copyfiles -u 1 ./src/lib/*.wasm ./dist/esm/"].join(" && "),
	{ stdio: "inherit" }
);

// Build CommonJS
console.log("⚡ Building CJS...");
cp.execSync(
	[
		"pnpm tsc -p ./tsconfig.cjs.json",
		"pnpm copyfiles -u 1 ./src/lib/*.wasm ./dist/cjs/"
	].join(" && "),
	{ stdio: "inherit" }
);

const finishedOn = Date.now();

console.log(`⚡ Took ${((finishedOn - startedOn) / 1000).toFixed(2)} s`);
