import path from "path";
import fs from "fs";

const file = path.resolve(__dirname, "../src/lib/photon_rs.js");

const originalScript = fs.readFileSync(file, "utf-8");

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
        input = new URL('photon_rs_bg.wasm', import.meta.url);
    }`,
		`//! Needed to remove these lines in order to make it work on node.js
    // if (typeof input === 'undefined') {
    //     input = new URL('photon_rs_bg.wasm', import.meta.url);
    // }`
	);

fs.writeFileSync(file, modifiedScript, "utf-8");
