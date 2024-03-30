import React from "react";
import { describe, test, expect } from "vitest";
import * as og from "../dist/cjs/node";

describe("Tests for og.render", () => {
	const renderer = og.render(<>Test</>);

	test("Check .asSvg() results", async () => {
		const svg = await renderer.asSvg();

		expect(svg)
			.property("image")
			.match(/<svg\s[^>]*width="1200".*<\/svg>/i)
			.match(/<svg\s[^>]*height="630".*<\/svg>/i);
	});

	test("Check .asPng() results", async () => {
		const png = await renderer.asPng();

		expect(png).property("pixels").instanceOf(Uint8Array);
		expect(png).property("image").instanceOf(Uint8Array);
	});
});

describe("Tests for og.ImageResponse", () => {
	const response = new og.ImageResponse(<div>Test</div>, {
		width: 200,
		height: 300,
		format: "svg"
	});

	test("Check response text", async () => {
		const text = await response.text();

		expect(text)
			.match(/<svg\s[^>]*width="200".*<\/svg>/i)
			.match(/<svg\s[^>]*height="300".*<\/svg>/i);
	});
});
