/**
 * LICENSE for detectRuntime
 *
 * MIT License
 *
 * Copyright (c) 2023 Tom Lienard
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

declare global {
	/* eslint-disable no-var, vars-on-top */
	// https://vercel.com/docs/concepts/functions/edge-functions/edge-runtime#check-if-you're-running-on-the-edge-runtime
	var EdgeRuntime: unknown;

	// https://docs.netlify.com/edge-functions/api/#netlify-global-object
	var Netlify: unknown;

	var Bun: unknown;

	var Deno: unknown;

	// eslint-disable-next-line no-underscore-dangle
	var __lagon__: unknown;

	var fastly: unknown;
	/* eslint-enable no-var, vars-on-top */
}

export type Runtime =
	| "edge-routine"
	| "workerd"
	| "deno"
	| "lagon"
	| "react-native"
	| "netlify"
	| "electron"
	| "node"
	| "bun"
	| "edge-light"
	| "fastly";

/**
 * Detect the current JavaScript runtime following
 * the WinterCG Runtime Keys proposal:
 *
 * - `edge-routine` - Alibaba Cloud Edge Routine
 * - `workerd` - Cloudflare Workers
 * - `deno` - Deno and Deno Deploy
 * - `lagon` - Lagon
 * - `react-native` - React Native
 * - `netlify` - Netlify Edge Functions
 * - `electron` - Electron
 * - `node` - Node.js
 * - `bun` - Bun
 * - `edge-light` - Vercel Edge Functions
 * - `fastly` - Fastly Compute@Edge
 *
 * @see https://runtime-keys.proposal.wintercg.org/
 * @returns {Runtime}
 */
export const detectRuntime = (): Runtime | undefined => {
	if (typeof Netlify === "object") {
		return "netlify";
	}

	if (typeof EdgeRuntime === "string") {
		return "edge-light";
	}

	if (typeof globalThis === "object") {
		// https://developers.cloudflare.com/workers/runtime-apis/web-standards/#navigatoruseragent
		if (globalThis.navigator?.userAgent === "Cloudflare-Workers") {
			return "workerd";
		}

		if (globalThis.Deno) {
			return "deno";
		}

		// eslint-disable-next-line no-underscore-dangle
		if (globalThis.__lagon__) {
			return "lagon";
		}

		// https://nodejs.org/api/process.html#processrelease
		if (globalThis.process?.release?.name === "node") {
			return "node";
		}

		if (globalThis.Bun) {
			return "bun";
		}

		if (globalThis.fastly) {
			return "fastly";
		}
	}

	// TODO: Find a way to detect edge-routine
	// it seems like it's currently in beta:
	// https://www.alibabacloud.com/help/en/dynamic-route-for-cdn/latest/er-overview

	// TODO: Find a way to detect react-native

	// TODO: Find a way to detect electron

	return undefined;
};
