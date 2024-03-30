import fs from "fs-extra";

const buildConfig = {
	resvgWasmPath: "@resvg/resvg-wasm/index_bg.wasm",
	resvgWasmName: "src/lib/resvg.wasm"
};

const resvgWasmResolvedPath = new URL(
	import.meta.resolve(buildConfig.resvgWasmPath)
).pathname;

fs.copySync(resvgWasmResolvedPath, buildConfig.resvgWasmName);
