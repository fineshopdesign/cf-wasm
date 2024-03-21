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
				devDependencies: [path.resolve(__dirname, "scripts/**/*")],
				includeInternal: false,
				includeTypes: false,
				packageDir: [__dirname, path.resolve(__dirname, "../..")]
			}
		]
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
			files: ["**/*.ts"],
			parserOptions: {
				project: [path.resolve(__dirname, "tsconfig.json")]
			}
		},
		{
			files: ["src/cjs/**/*.ts"],
			parserOptions: {
				project: [path.resolve(__dirname, "tsconfig.cjs.json")]
			}
		}
	]
};

module.exports = eslintConfig;
