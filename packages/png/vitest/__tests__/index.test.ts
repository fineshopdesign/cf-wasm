import { test, expect } from "vitest";
import * as png from "../../dist/node/cjs";

test("png.MODULE should be an instance of WebAssembly.Module", () => {
	expect(png.MODULE).instanceOf(WebAssembly.Module);
});
