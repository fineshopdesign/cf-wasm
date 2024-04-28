import cp from "node:child_process";
import fs from "fs-extra";
import clc from "console-log-colors";

const startedOn = Date.now();

// Clean out dir
console.log("⚡ Cleaning dist directory...");
fs.rmSync("dist", { recursive: true, force: true });

// Build ESM
console.log("⚡ Building ESM version...");
cp.execSync(
	["pnpm tsc", "pnpm copyfiles -u 1 ./src/lib/*.bin ./dist/esm/"].join(" && "),
	{ stdio: "inherit" }
);

// Build CommonJS
console.log("⚡ Building CJS version...");
cp.execSync(
	[
		"pnpm tsc -p ./tsconfig.cjs.json",
		"pnpm copyfiles -u 1 ./src/lib/*.bin ./dist/cjs/"
	].join(" && "),
	{ stdio: "inherit" }
);

// Build Types
console.log("⚡ Building Types...");
cp.execSync("pnpm tsc -p ./tsconfig.dts.json", { stdio: "inherit" });

// Write package.json
console.log("⚡ Writing package.json files...");
const cjsPackageJSON = { type: "commonjs" };

fs.writeJSONSync("dist/cjs/package.json", cjsPackageJSON);
fs.writeJSONSync("dist/dts/package.json", cjsPackageJSON);

const finishedOn = Date.now();

console.log(
	clc.green(`⚡ Took ${((finishedOn - startedOn) / 1000).toFixed(2)} s`)
);
