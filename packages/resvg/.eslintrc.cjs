// @ts-check

const path = require("node:path");
const { defineConfig } = require("eslint-define-config");

module.exports = defineConfig({
	ignorePatterns: ["src/lib/", "crate/"],
	extends: [path.join(__dirname, "../../.eslintrc.cjs")],
	settings: {
		"import/resolver": {
			typescript: { project: [path.join(__dirname, "tsconfig.json")] }
		}
	},
	rules: {
		"import/no-extraneous-dependencies": ["error", { packageDir: [__dirname] }]
	},
	overrides: [
		{
			files: ["src/**/*.ts"],
			parserOptions: {
				project: [path.resolve(__dirname, "tsconfig.json")]
			}
		},
		{
			files: [".eslintrc.cjs", "scripts/**/*"],
			rules: {
				"import/no-extraneous-dependencies": [
					"error",
					{
						devDependencies: true,
						packageDir: [__dirname, path.resolve(__dirname, "../..")]
					}
				]
			}
		}
	]
});
