import childProcess from "node:child_process";
import path from "node:path";
import fs from "node:fs";

const buildWasmConfig = {
	crate: "crate",
	outDir: "src/lib",
	outName: "png"
};

childProcess.execSync(
	`wasm-pack build ${buildWasmConfig.crate} --out-dir ${path.join("..", buildWasmConfig.outDir)} --out-name ${buildWasmConfig.outName} --target web`,
	{
		stdio: "inherit"
	}
);

[
	"package.json",
	"LICENSE",
	"LICENSE.md",
	"README",
	"README.md",
	".gitignore"
].forEach((file) =>
	fs.rmSync(path.join(buildWasmConfig.outDir, file), { force: true })
);

const jsOutFile = path.join(
	buildWasmConfig.outDir,
	`${buildWasmConfig.outName}.js`
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
        input = new URL('${buildWasmConfig.outName}_bg.wasm', import.meta.url);
    }`,
		`//! Needed to remove these lines in order to make it work on node.js
    // if (typeof input === 'undefined') {
    //     input = new URL('${buildWasmConfig.outName}_bg.wasm', import.meta.url);
    // }`
	);

fs.writeFileSync(jsOutFile, modifiedScript, "utf-8");
