/* eslint-disable no-console */

/**
 * This script is heavily inspired by `built.ts` used in @kaze-style/react.
 * https://github.com/taishinaritomi/kaze-style/blob/main/scripts/build.ts
 * MIT License
 * Copyright (c) 2022 Taishi Naritomi
 */

import cp from "node:child_process";
import path from "node:path";
import fs from "fs-extra";
import {
	build as esbuild,
	type Plugin,
	type PluginBuild,
	type BuildOptions
} from "esbuild";
import * as glob from "glob";
import clc from "console-log-colors";

/**
 * This plugin is inspired by the following.
 * https://github.com/evanw/esbuild/issues/622#issuecomment-769462611
 */
const addExtension = (
	fileMap: { from: string; to: string }[] = [{ from: ".ts", to: ".js" }]
): Plugin => ({
	name: "add-extension",
	setup(build: PluginBuild) {
		// eslint-disable-next-line consistent-return
		build.onResolve({ filter: /.*/ }, (args) => {
			if (args.importer) {
				const p = path.join(args.resolveDir, args.path);

				let importPath = "";

				fileMap.forEach((config) => {
					let formPath = `${p}${config.from}`;
					if (fs.existsSync(formPath)) {
						importPath = args.path + config.to;
					} else {
						formPath = path.join(
							args.resolveDir,
							args.path,
							`index${config.from}`
						);
						if (fs.existsSync(formPath)) {
							importPath = `${args.path}/index${config.to}`;
						}
					}
				});

				return { path: importPath, external: true };
			}
		});
	}
});

// Entrypoints for ESM
const esmEntryPoints = glob.sync("./src/**/*.{ts,js}", {
	ignore: ["**/*.d.ts", "./src/**/*.test.ts"]
});

// Entrypoints for CJS
const cjsEntryPoints = glob.sync("./src/**/*.{ts,js}", {
	ignore: [
		"**/*.d.ts",
		"./src/**/*.test.ts",
		"src/workers/**/*",
		"src/next/**/*"
	]
});

// Common build options for both CJS and ESM
const commonOptions: BuildOptions = {
	logLevel: "info",
	platform: "node"
};

// Build options for ESM
const esmOptions: BuildOptions = {
	...commonOptions,
	entryPoints: esmEntryPoints,
	bundle: true,
	outbase: "./src",
	outdir: "./dist/esm",
	format: "esm",
	plugins: [
		addExtension([
			{ from: ".ts", to: ".js" },
			{ from: ".js", to: ".js" }
		])
	],
	define: {
		// ensure `__filename` and `__dirname` is not available in ESM module
		__filename: JSON.stringify(null),
		__dirname: JSON.stringify(null)
	}
};

// Build options for CJS
const cjsOptions: BuildOptions = {
	...commonOptions,
	entryPoints: cjsEntryPoints,
	outbase: "src",
	outdir: "dist/cjs",
	format: "cjs",
	define: {
		// ensure `import.meta` is not available in CJS module
		"import.meta": JSON.stringify({ url: "" })
	}
};

const startedOn = Date.now();

// Clean out dir
console.log("⚡ Cleaning dist directory...");
fs.rmSync("dist", { recursive: true, force: true });

// Build ESM
console.log("⚡ Building ESM version...");
await esbuild(esmOptions).catch(console.error);

// Build CJS
console.log("⚡ Building CJS version...");
await esbuild(cjsOptions).catch(console.error);

// Build typings
console.log("⚡ Building Types...");
cp.execSync(`tsc --project tsconfig.dts.json --outDir dist/dts`, {
	stdio: "inherit"
});

// Copy assets
console.log("⚡ Copying Assets...");
glob.sync("./src/**/*.{wasm,bin}").forEach((filepath) => {
	const destinations = ["./dist/esm", "./dist/cjs"].map((directory) =>
		path.join(directory, filepath.replace(/^src\//, ""))
	);
	console.log("");
	destinations.forEach((destination) => {
		console.log(`  ${clc.white(filepath)} => ${clc.white(destination)}`);
		fs.copyFileSync(filepath, destination);
	});
	console.log("");
});

// Write package.json for CJS
console.log("⚡ Writing package.json files...");
const cjsPackageJson = { type: "commonjs" };

["./dist/cjs/package.json", "./dist/dts/package.json"].forEach(
	(destination) => {
		fs.writeJSONSync(destination, cjsPackageJson, {
			encoding: "utf8"
		});
	}
);

// Print time taken
const finishedOn = Date.now();
console.log(
	clc.green(`⚡ Took ${((finishedOn - startedOn) / 1000).toFixed(2)} s`)
);
