const path = require("path");

/** @type {import("eslint-define-config").ESLintConfig} */
const eslintConfig = {
	root: true,
	extends: ["../../.eslintrc.cjs"],
	ignorePatterns: [
		// production
		"dist/",
		"lib/",
		"typings/",
		// crate
		"crate/"
	],
	settings: {
		"import/resolver": {
			typescript: {
				project: [path.resolve(__dirname, "tsconfig.json")]
			}
		}
	},
	overrides: [
		{
			files: ["src/cjs/**/*.js", "src/cjs/**/*.ts"],
			settings: {
				"import/resolver": {
					typescript: {
						project: [path.resolve(__dirname, "tsconfig.cjs.json")]
					}
				}
			}
		},
		{
			files: ["src/**/*.ts"],
			parserOptions: {
				project: [path.resolve(__dirname, "tsconfig.json")]
			}
		},
		{
			files: ["src/cjs/**/*.ts"],
			extends: [
				"plugin:@typescript-eslint/recommended",
				"plugin:@typescript-eslint/recommended-requiring-type-checking"
			],
			parserOptions: {
				project: [path.resolve(__dirname, "tsconfig.cjs.json")]
			}
		}
	]
};

module.exports = eslintConfig;
