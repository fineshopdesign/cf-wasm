import childProcess from "node:child_process";
import path from "node:path";

import buildConfig from "./config.mjs";

// Build wasm binaries and modules using wasm-pack
childProcess.execSync(
	`wasm-pack build ${buildConfig.wasm.crate} --out-dir ${path.join("..", buildConfig.wasm.out)} --out-name ${buildConfig.wasm.name} --target web`,
	{
		stdio: "inherit"
	}
);
