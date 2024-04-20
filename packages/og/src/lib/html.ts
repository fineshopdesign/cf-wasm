import {
	convertHtmlToReact,
	type ParserOptions
} from "@hedgedoc/html-to-react";

export { type ParserOptions };

export const symbolReactElement = Symbol.for("react.element");
export const symbolReactFragment = Symbol.for("react.fragment");

const cloneProps = (input: {
	children?:
		| React.ReactElement
		| string
		| null
		| (React.ReactElement | string | null)[];
}) => {
	const props = { ...input };
	if ("children" in props) {
		const { children } = props;
		if (typeof children === "undefined" || children === null) {
			delete props.children;
		} else if (typeof children === "string") {
			props.children = children;
		} else if (Array.isArray(children)) {
			const filtered = children
				.filter((child) => typeof child === "string" || Boolean(child))
				.map((child) =>
					// eslint-disable-next-line @typescript-eslint/no-use-before-define, no-use-before-define
					typeof child === "object" && child ? cloneElement(child) : child
				);

			if (filtered.length === 0) {
				delete props.children;
			} else if (filtered.length === 1 && typeof filtered[0] === "string") {
				props.children = filtered[0];
			} else {
				props.children = filtered;
			}
		}
	}

	return props;
};

const cloneElement = (element: React.ReactElement) => {
	const result = { ...element };
	if (typeof result.props === "object" && result.props) {
		result.props = cloneProps(
			result.props as unknown as Parameters<typeof cloneProps>[0]
		);
	}

	return result;
};

const fragment = (
	children: (string | React.ReactElement | null)[]
): React.ReactElement => ({
	// @ts-expect-error private property
	$$typeof: symbolReactElement,
	type: symbolReactFragment as unknown as React.ReactElement["type"],
	key: null,
	ref: null,
	props: { children },
	_owner: null,
	_store: {}
});

const wrapper = (
	children: (string | React.ReactElement | null)[]
): React.ReactElement => {
	if (children.length === 1 && typeof children[0] === "object" && children[0]) {
		const parent = cloneElement(children[0]);
		parent.key = null;
		return parent;
	}

	return cloneElement(fragment(children));
};

export const parseHTML = (
	html: string,
	options?: ParserOptions
): React.ReactElement => {
	if (typeof html !== "string") {
		throw new TypeError("Argument 1 must be of type string");
	}
	if (html.trim().length === 0) {
		throw new Error("Empty string cannot be parsed");
	}

	return wrapper(convertHtmlToReact(html, options));
};
