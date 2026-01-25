import { convertHtmlToReact, type ParserOptions as HTMLToReactParserOptions } from '@hedgedoc/html-to-react';
import { createElement, Fragment, isValidElement, type ReactElement, type ReactNode } from 'react';

export interface ParserOptions extends HTMLToReactParserOptions {
  tailwind?: boolean | 'data' | 'class';
}

class Transformer {
  private options: ParserOptions & { tailwind: boolean | 'data' | 'class' };

  constructor(options: ParserOptions = {}) {
    this.options = { tailwind: false, ...options };
  }

  transform(html: string): ReactElement {
    return this.wrapper(convertHtmlToReact(html));
  }

  wrapper(children: (ReactElement | string | null)[]): ReactElement {
    if (children.length === 1 && isValidElement(children[0])) {
      return this.element(children[0]);
    }

    return this.fragment(children);
  }

  element(element: ReactElement) {
    return createElement(element.type, typeof element.props === 'object' && element.props ? this.props(element.props) : {});
  }

  fragment(children: ReactNode): ReactElement {
    const transformed = this.children(children);
    return createElement(Fragment, typeof transformed !== 'undefined' ? { children: transformed } : {});
  }

  props(input: { children?: ReactNode; className?: unknown; tw?: unknown; 'data-tw'?: unknown }) {
    const props = { ...input };

    if ('children' in props) {
      const transformed = this.children(props.children);
      if (typeof transformed === 'undefined') {
        delete props.children;
      } else {
        props.children = transformed;
      }
    }

    if (this.options.tailwind === true || this.options.tailwind === 'class') {
      if ('className' in props && typeof props.className === 'string') {
        props.tw = props.className;
      }
    } else if (this.options.tailwind === 'data') {
      if ('data-tw' in props && typeof props['data-tw'] === 'string') {
        props.tw = props['data-tw'];
      }
    }

    return props;
  }

  children(children: ReactNode): ReactNode {
    if (children === null || typeof children === 'undefined' || typeof children === 'boolean') {
      return undefined;
    }
    if (isValidElement(children)) {
      return this.element(children);
    }
    if (Array.isArray(children)) {
      const filtered: ReactNode[] = [];

      for (const child of children) {
        if (child === null || typeof child === 'undefined' || typeof child === 'boolean') {
          continue;
        }
        if (isValidElement(child)) {
          filtered.push(this.element(child));
        } else {
          filtered.push(child);
        }
      }

      if (filtered.length === 0) {
        return undefined;
      }
      if (filtered.length === 1) {
        return filtered[0];
      }
      return filtered;
    }
    return children;
  }
}

/**
 * A helper function to parse html string to a {@link ReactElement} like object
 *
 * @param html The html string to parse
 * @param options Options
 *
 * @returns The {@link ReactElement}
 */
export const htmlToReact = (html: string, options: ParserOptions = {}): ReactElement => {
  if (typeof html !== 'string') {
    throw new TypeError('Argument 1 must be of type string');
  }
  if (html.trim().length === 0) {
    throw new TypeError('Blank html string cannot be parsed');
  }

  return new Transformer(options).transform(html);
};

export { htmlToReact as t };
