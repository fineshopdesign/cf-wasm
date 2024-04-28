import { test, expect } from "vitest";
import * as png from "@cf-wasm/png/node";

test("png.MODULE should be an instance of WebAssembly.Module", () => {
	expect(png.MODULE).instanceOf(WebAssembly.Module);
});
