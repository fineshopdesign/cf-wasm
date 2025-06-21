import { convertHtmlToReact, type ParserOptions } from '@hedgedoc/html-to-react';
import { createElement, Fragment, type ReactElement } from 'react';

export type { ParserOptions };

export type ReactChild = ReactElement | string | null;

export const props = (input: { children?: ReactChild | ReactChild[] }) => {
  const props = { ...input };
  if ('children' in props) {
    const { children } = props;
    if (typeof children === 'undefined' || children === null) {
      delete props.children;
    } else if (typeof children === 'string') {
      props.children = children;
    } else if (Array.isArray(children)) {
      const filtered = children
        .filter((child) => typeof child === 'string' || Boolean(child))
        .map((child) => (typeof child === 'object' && child ? element(child) : child));

      if (filtered.length === 0) {
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

export const element = (element: ReactElement) =>
  createElement(element.type, typeof element.props === 'object' && element.props ? props(element.props) : {});

export const fragment = (children: ReactChild[]): ReactElement => createElement(Fragment, { children });

export const wrapper = (children: ReactChild[]): ReactElement => {
  if (children.length === 1 && typeof children[0] === 'object' && children[0]) {
    return element({ ...children[0], key: null });
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
export const htmlToReact = (html: string, options?: ParserOptions): ReactElement => {
  if (typeof html !== 'string') {
    throw new TypeError('Argument 1 must be of type string');
  }
  if (html.trim().length === 0) {
    throw new TypeError('Blank html string cannot be parsed');
  }

  return wrapper(convertHtmlToReact(html, options));
};
