import childProcess from "node:child_process";
import fs from "fs-extra";
import buildConfig from "./config.mjs";

// Clean out dir
console.log("⚡ Cleaning dist dir...");
fs.rmSync("dist", { recursive: true, force: true });

const wasmFileLocation = new URL(import.meta.resolve(buildConfig.wasm.from))
	.pathname;

fs.copySync(wasmFileLocation, buildConfig.wasm.to);

// Build ESM
console.log("⚡ Building ESM...");
childProcess.execSync("npx tsc");
childProcess.execSync("npx copyfiles -u 1 ./src/lib/*.wasm ./dist/esm/");

// Build CommonJS
console.log("⚡ Building CommonJS...");
childProcess.execSync("npx tsc -p ./tsconfig.cjs.json");
childProcess.execSync("npx copyfiles -u 1 ./src/lib/*.wasm ./dist/cjs/");
