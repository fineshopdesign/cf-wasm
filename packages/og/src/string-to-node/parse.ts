import { type ParserOptions, convertHtmlToReact } from '@hedgedoc/html-to-react';
import type { ReactElement } from 'react';

export type { ParserOptions };

type ReactChild = ReactElement | string | null;

const SYMBOL_REACT_ELEMENT = Symbol.for('react.element');
const SYMBOL_REACT_FRAGMENT = Symbol.for('react.fragment');

const props = (input: {
  children?: ReactChild | ReactChild[];
}) => {
  const props = { ...input };
  if ('children' in props) {
    const { children } = props;
    if (typeof children === 'undefined' || children === null) {
      // biome-ignore lint/performance/noDelete: we need to delete nullish children
      delete props.children;
    } else if (typeof children === 'string') {
      props.children = children;
    } else if (Array.isArray(children)) {
      const filtered = children
        .filter((child) => typeof child === 'string' || Boolean(child))
        .map((child) => (typeof child === 'object' && child ? element(child) : child));

      if (filtered.length === 0) {
        // biome-ignore lint/performance/noDelete: we need to delete nullish children
        delete props.children;
      } else if (filtered.length === 1 && typeof filtered[0] === 'string') {
        props.children = filtered[0];
      } else {
        props.children = filtered;
      }
    }
  }

  return props;
};

const element = (element: ReactElement) => {
  const result = { ...element };
  if (typeof result.props === 'object' && result.props) {
    result.props = props(result.props);
  }

  return result;
};

const fragment = (children: ReactChild[]): ReactElement => ({
  // @ts-expect-error: we need to add private property
  $$typeof: SYMBOL_REACT_ELEMENT,
  type: SYMBOL_REACT_FRAGMENT as unknown as ReactElement['type'],
  key: null,
  ref: null,
  props: { children },
  _owner: null,
  _store: {},
});

const wrapper = (children: ReactChild[]): ReactElement => {
  if (children.length === 1 && typeof children[0] === 'object' && children[0]) {
    const parent = element(children[0]);
    parent.key = null;
    return parent;
  }

  return element(fragment(children));
};

/**
 * A helper function to parse html string to a {@link ReactElement} like object
 *
 * @param html The html string to parse
 * @param options Options
 *
 * @returns The {@link ReactElement}
 */
export const stringToNode = (html: string, options?: ParserOptions): ReactElement => {
  if (typeof html !== 'string') {
    throw new TypeError('Argument 1 must be of type string');
  }
  if (html.trim().length === 0) {
    throw new TypeError('Empty html string cannot be parsed');
  }

  return wrapper(convertHtmlToReact(html, options));
};
