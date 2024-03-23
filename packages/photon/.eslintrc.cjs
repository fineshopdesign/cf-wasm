const path = require("path");

/** @type {import("eslint-define-config").ESLintConfig} */
const eslintConfig = {
	root: true,
	extends: [path.resolve(__dirname, "../../.eslintrc.cjs")],
	settings: {
		"import/resolver": {
			typescript: {
				project: [path.resolve(__dirname, "tsconfig.json")]
			}
		}
	},
	rules: {
		"import/no-extraneous-dependencies": [
			"error",
			{
				devDependencies: [
					path.resolve(__dirname, "scripts/**/*"),
					path.resolve(__dirname, "vitest/**/*")
				],
				includeInternal: false,
				includeTypes: false,
				packageDir: [__dirname, path.resolve(__dirname, "../..")]
			}
		]
	},
	overrides: [
		{
			files: ["**/*.ts"],
			parserOptions: {
				project: [path.resolve(__dirname, "tsconfig.json")]
			}
		},
		{
			files: ["src/cjs/**/*.ts"],
			parserOptions: {
				project: [path.resolve(__dirname, "tsconfig.cjs.json")]
			},
			settings: {
				"import/resolver": {
					typescript: {
						project: [path.resolve(__dirname, "tsconfig.cjs.json")]
					}
				}
			}
		},
		{
			files: ["scripts/**/*.ts"],
			parserOptions: {
				project: [path.resolve(__dirname, "scripts/tsconfig.json")]
			},
			settings: {
				"import/resolver": {
					typescript: {
						project: [path.resolve(__dirname, "scripts/tsconfig.json")]
					}
				}
			}
		},
		{
			files: ["vitest/**/*.ts"],
			parserOptions: {
				project: [path.resolve(__dirname, "vitest/tsconfig.json")]
			},
			settings: {
				"import/resolver": {
					typescript: {
						project: [path.resolve(__dirname, "vitest/tsconfig.json")]
					}
				}
			}
		}
	]
};

module.exports = eslintConfig;
