import fs from "fs-extra";

const buildConfig = {
	yogaWasmPath: "yoga-wasm-web/dist/yoga.wasm",
	yogaWasmName: "src/lib/yoga.wasm"
};

const yogaWasmResolvedPath = new URL(
	import.meta.resolve(buildConfig.yogaWasmPath)
).pathname;

fs.copySync(yogaWasmResolvedPath, buildConfig.yogaWasmName);
