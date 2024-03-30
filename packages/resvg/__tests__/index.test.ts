import { test, expect } from "vitest";
import * as resvg from "../dist/cjs/node";

test("resvg.MODULE should be an instance of WebAssembly.Module", () => {
	expect(resvg.MODULE).instanceOf(WebAssembly.Module);
});
