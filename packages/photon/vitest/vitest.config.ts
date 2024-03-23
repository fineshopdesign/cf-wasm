import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
	test: {
		include: ["vitest/**/*.{test,spec}.?(c|m)[jt]s?(x)"],
		environment: "node"
	}
});
