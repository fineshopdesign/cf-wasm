import { test, expect } from "vitest";
import * as satori from "../dist/cjs/node";

test("satori.YOGA_MODULE should be an instance of WebAssembly.Module", () => {
	expect(satori.YOGA_MODULE).instanceOf(WebAssembly.Module);
});
