/** @type {import("eslint-define-config").ESLintConfig} */
const eslintConfig = {
	root: true,
	extends: [
		"airbnb-base",
		"plugin:import/errors",
		"plugin:import/warnings",
		"plugin:import/typescript",
		"prettier"
	],
	plugins: ["prettier", "import"],
	env: {
		browser: false,
		node: true,
		es2022: true
	},
	parser: "@typescript-eslint/parser",
	parserOptions: {
		ecmaVersion: 2022,
		sourceType: "module",
		ecmaFeatures: {
			jsx: true
		}
	},
	settings: {
		"import/extensions": [".js", ".ts", ".jsx", ".tsx"],
		"import/parsers": {
			"@typescript-eslint/parser": [".ts", ".tsx"]
		},
		"import/resolver": {
			node: {
				extensions: [".js", ".ts", ".jsx", ".tsx"]
			},
			typescript: {}
		}
	},
	rules: {
		"prettier/prettier": "warn",
		"prefer-destructuring": ["error", { object: true, array: false }],
		"no-param-reassign": ["error", { props: false }],
		"no-restricted-exports": "off",
		"import/extensions": [
			"error",
			"ignorePackages",
			{
				js: "never",
				ts: "never",
				jsx: "never",
				tsx: "never"
			}
		],
		"@typescript-eslint/no-use-before-define": [
			"error",
			{
				functions: false,
				classes: false,
				variables: true,
				ignoreTypeReferences: true
			}
		]
	},
	overrides: [
		{
			files: ["**/*.ts", "**/*.tsx"],
			extends: [
				"plugin:@typescript-eslint/recommended",
				"plugin:@typescript-eslint/recommended-requiring-type-checking"
			],
			plugins: ["@typescript-eslint"]
		}
	]
};

module.exports = eslintConfig;
