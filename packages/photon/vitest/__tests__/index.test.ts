import { test, expect } from "vitest";
import * as photon from "../../dist/node/cjs";

test("photon.MODULE should be an instance of WebAssembly.Module", () => {
	expect(photon.MODULE).instanceOf(WebAssembly.Module);
});
