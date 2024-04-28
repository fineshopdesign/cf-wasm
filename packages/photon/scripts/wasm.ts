import cp from "node:child_process";
import path from "node:path";

import buildConfig from "./config";

// Build wasm binaries and modules using wasm-pack
cp.execSync(
	`wasm-pack build ${buildConfig.wasm.crate} --out-dir ${path.join("..", buildConfig.wasm.out)} --out-name ${buildConfig.wasm.name} --target web`,
	{
		stdio: "inherit"
	}
);
