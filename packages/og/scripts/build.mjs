import cp from "node:child_process";
import fs from "node:fs";

const startedOn = Date.now();

// Clean out dir
console.log("⚡ Cleaning dist dir...");
fs.rmSync("dist", { recursive: true, force: true });

// Build ESM
console.log("⚡ Building ESM...");
cp.execSync(
	["pnpm tsc", "pnpm copyfiles -u 1 ./src/lib/*.bin ./dist/esm/"].join(" && "),
	{ stdio: "inherit" }
);

// Build CommonJS
console.log("⚡ Building CJS...");
cp.execSync(
	[
		"pnpm tsc -p ./tsconfig.cjs.json",
		"pnpm copyfiles -u 1 ./src/lib/*.bin ./dist/cjs/"
	].join(" && "),
	{ stdio: "inherit" }
);

const finishedOn = Date.now();

console.log(`⚡ Took ${((finishedOn - startedOn) / 1000).toFixed(2)} s`);
