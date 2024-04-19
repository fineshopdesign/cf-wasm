import childProcess from "node:child_process";
import path from "node:path";
import fs from "node:fs";

// Clean out dir
console.log("⚡ Cleaning dist dir...");
fs.rmSync("dist", { recursive: true, force: true });

// Build ESM
console.log("⚡ Building ESM...");
childProcess.execSync("npx tsc");
childProcess.execSync("npx copyfiles -u 1 ./src/lib/*.bin ./dist/esm/");

// Build CommonJS
console.log("⚡ Building CommonJS...");
childProcess.execSync("npx tsc -p ./tsconfig.cjs.json");
childProcess.execSync("npx copyfiles -u 1 ./src/lib/*.bin ./dist/cjs/");
