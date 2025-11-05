import { detectRuntime } from '@cf-wasm/internals/detect-runtime';
import type { ReactElement } from 'react';
import { FetchError } from './core/errors';
import type { FontBuffer } from './core/font';
import { modules } from './core/modules';
import { type Font, type PngResult, type RenderOptions, render, type SvgResult } from './core/render';
import { BaseResponse, type BaseResponseOptions, type ImageResponseOptions } from './core/response';
import type { FontWeight } from './core/satori';
import type { MayBePromise } from './core/types';
import { replaceEntities } from './core/utils/entities';

/** Make sure modules are set by importing the main module */
if (!modules.isUsable()) {
  throw new Error(
    `Modules are not initialized! Please import the main module based on runtime (i.e. '@cf-wasm/og', '@cf-wasm/og/next', etc.) before importing the 'figma' submodule (i.e. '@cf-wasm/og/figma').
For example:
------------
import '@cf-wasm/og/next'; // <- import main module based on runtime first
import { FigmaImageResponse } from '@cf-wasm/og/figma' // <- now you can import figma submodule

// ...
------------`,
  );
}

/** An interface representing the element result of a figma template */
export interface ElementResult {
  /** The element as {@link ReactElement} */
  // biome-ignore lint/suspicious/noExplicitAny: we need to use `any` here
  element: ReactElement<any, string | React.JSXElementConstructor<any>>;

  /** The width of the image */
  width: number;

  /** The height of the image */
  height: number;

  /** The dynamic fonts */
  fonts: Font[];
}

/** An interface representing a figma complex template */
export interface FigmaComplexTemplate {
  value: string;
  props?: {
    centerHorizontally?: boolean;
  } & React.CSSProperties;
}

/** An interface representing figma options */
export interface FigmaOptions {
  /**
   * Link to the Figma template frame.
   *
   * You can get the URL in Figma by right-clicking a frame and selecting "Copy link".
   * @example https://www.figma.com/file/QjGNQixWnhu300e1Xzdl2y/OG-Images?type=design&node-id=11356-2443&mode=design&t=yLROd7ro8mP1PxMY-4
   */
  url: string;

  /**
   * A mapping between Figma layer name and the value you want to replace it with.
   *
   * @example Sets Figma text layer named "Title" to "How to create OG Images"
   * ```js
   *  { "Title": "How to create OG Images" }
   * ```
   *
   * @example Sets multiple Figma text layers and provides custom styles
   * ```js
   * {
   *   "Title": { value: "How to create OG Images", props: { color: "red", centerHorizontally: true } },
   *   "Description": { value: "A short story", props: { centerHorizontally: true } },
   * }
   * ```
   *
   * `centerHorizontally` centers text layer horizontally.
   */
  template: Record<string, FigmaComplexTemplate | string>;

  /** Figma API token */
  token: string;
}

export type LoadFontsFunction = (
  fontFamily: string,
  fontWeight: FontWeight | undefined,
  fontStyle: 'normal' | 'italic' | undefined,
) => MayBePromise<ArrayBuffer | FontBuffer | undefined>;

/** An interface representing options for {@link renderFigma} function */
export interface RenderFigmaOptions extends Omit<RenderOptions, 'width' | 'height'> {
  loadFonts?: LoadFontsFunction;
}

/** An interface representing options for {@link FigmaImageResponse} */
export interface FigmaImageResponseOptions extends RenderFigmaOptions, BaseResponseOptions {}

/**
 * A helper function to parse figma url and return its `fileId` and `nodeId`
 *
 * @param figmaUrl The figma file url
 *
 * @returns An object containing `fileId` and `nodeId`
 */
function parseFigmaUrl(figmaUrl: string) {
  const regex = /\/file\/([^/]+)\/[^?]+\?[^#]*node-id=([^&#]+)/;
  const match = figmaUrl.match(regex);
  let fileId = '';
  let nodeId = '';
  if (match) {
    fileId = match[1] || '';
    nodeId = match[2] || '';
  }
  return { fileId, nodeId };
}

/**
 * Asserts if value is undefined
 *
 * @param value The value
 * @param errorMessage The error message
 *
 * @returns The same value if it is not undefined otherwise throws an error
 */
function assertValue(value: string | undefined, errorMessage: string) {
  if (typeof value === 'undefined') {
    throw new Error(errorMessage);
  }
  return value;
}

/**
 * Matches string with regex and returns the content at given index
 *
 * @param string The string
 * @param matcher The regex
 * @param index The index to get
 * @default 1
 * @param defaultValue The default value if content at given index is not found
 * @default ""
 *
 * @returns The matched string
 */
function match(string: string, matcher: RegExp, index = 1, defaultValue = '') {
  const matches = string.match(matcher);
  if (matches && typeof matches[index] === 'string') {
    return matches[index];
  }
  return defaultValue;
}

/**
 * Checks if target is a figma complex template
 *
 * @param template The complex template or any value
 *
 * @returns `true` if the target is a complex template otherwise `false`
 */
function isComplexTemplate(template: unknown) {
  return typeof template !== 'string' && template !== undefined && 'value' in (template as { value?: unknown });
}

/**
 * Converts svg string to base64 data uri string
 *
 * @param svg The svg as string
 *
 * @returns The base64 data uri string for the svg
 */
function svgToBase64(svg: string) {
  let base64: string;
  if (typeof Buffer !== 'undefined') {
    base64 = Buffer.from(svg).toString('base64');
  } else if (typeof btoa === 'function') {
    base64 = btoa(svg);
  } else {
    throw new Error('Base64 encoding is not supported in this environment.');
  }

  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Gets the `width` and `height` of the svg string
 *
 * @param svg The svg string
 *
 * @returns An Object containing `width` and `height`
 */
function getSvgDimensions(svg: string) {
  const widthMatch = svg.match(/width="(\d+)/);
  const heightMatch = svg.match(/height="(\d+)/);
  if (widthMatch && heightMatch) {
    const width = Number(widthMatch[1]);
    const height = Number(heightMatch[1]);
    return { width, height };
  }
  return { width: 0, height: 0 };
}

/**
 * Gives all the text nodes in a svg string
 *
 * @param svg The svg as string
 *
 * @returns An Array of text nodes as string
 */
function getTextNodes(svg: string) {
  const regex = /<text[^>]*>(.*?)<\/text>/g;
  let execArray = regex.exec(svg);
  const matches = [];
  while (execArray !== null) {
    matches.push(execArray[0]);
    execArray = regex.exec(svg);
  }
  return matches;
}

/**
 * Gives all the tspan nodes in a text node string
 *
 * @param svg The text node as string
 *
 * @returns An Array of tspan nodes as string
 */
function getTspanNodes(text: string) {
  const regex = /<tspan[^>]*>(.*?)<\/tspan>/g;
  let execArray = regex.exec(text);
  const matches = [];
  while (execArray !== null) {
    matches.push(execArray[0]);
    execArray = regex.exec(text);
  }
  return matches;
}

/**
 * Parses the tspan node of a svg and returns its attributes
 *
 * @param tspanNode The tspan node as string
 *
 * @returns The attributes of the tspan node as an object
 */
function parseTspanNode(tspanNode: string) {
  return {
    x: match(tspanNode, /x="([^"]*)"/),
    y: match(tspanNode, /y="([^"]*)"/),
    content: replaceEntities(match(tspanNode, /<tspan[^>]*>([^<]*)<\/tspan>/)),
  };
}

/**
 * Parses the text node of a svg and returns its attributes
 *
 * @param textNode The text node as string
 *
 * @returns The attributes of the text node as an object
 */
function parseTextNode(textNode: string) {
  const tspanNodesAttributes = getTspanNodes(textNode).map(parseTspanNode);

  return {
    id: match(textNode, /id="([^"]*)"/),
    fill: match(textNode, /fill="([^"]*)"/),
    fontFamily: match(textNode, /font-family="([^"]*)"/),
    fontSize: match(textNode, /font-size="([^"]*)"/),
    fontWeight:
      match(textNode, /font-weight="([^"]*)"/)
        .replace('normal', '400')
        .replace('bold', '700') || undefined,
    fontStyle: (match(textNode, /font-style="([^"]*)"/) || undefined) as 'normal' | 'italic' | undefined,
    letterSpacing: match(textNode, /letter-spacing="([^"]*)"/),
    x: tspanNodesAttributes[0].x,
    y: tspanNodesAttributes[0].y,
    children: tspanNodesAttributes,
  };
}

/**
 * Removes all the text nodes of a svg string
 *
 * @param svg The svg as string
 *
 * @returns The replaced svg as string
 */
function removeTextNodes(svg: string) {
  return svg.replace(/<text[^>]*>(.*?)<\/text>/g, '');
}

/**
 * Get the Figma template's svg
 *
 * @param figmaOptions The {@link FigmaOptions}
 *
 * @returns The svg as string
 */
async function getFigmaSvg(figmaOptions: FigmaOptions) {
  const { url, token } = figmaOptions;
  const { fileId, nodeId } = parseFigmaUrl(url);

  assertValue(url, "(@cf-wasm/og) [ERROR] 'url' field is required");
  assertValue(token, "(@cf-wasm/og) [ERROR] 'token' field is required");

  const apiUrl = `https://api.figma.com/v1/images/${fileId}?ids=${nodeId}&svg_outline_text=false&format=svg&svg_include_id=true`;
  const figmaResponse = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      'X-FIGMA-TOKEN': token,
    },
    // This is to prevent errors on workerd runtime
    ...(detectRuntime() === 'workerd' ? undefined : { cache: 'no-store' }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new FetchError(`Response was not successful (status: ${res.status}, statusText: ${res.statusText})`, { response: res });
      }
      return res;
    })
    .catch((e) => {
      throw new FetchError(`Failed to fetch figma image. An error ocurred while fetching ${apiUrl}`, {
        cause: e,
        response: e instanceof FetchError ? e.response : undefined,
      });
    });

  const figmaResponseJson = (await figmaResponse.json()) as {
    images: Record<string, string>;
  };
  const svgDownloadPath = figmaResponseJson.images[nodeId.replace('-', ':')];
  const svgResponse = await fetch(
    svgDownloadPath,
    // This is to prevent errors on workerd runtime
    detectRuntime() === 'workerd' ? undefined : { cache: 'no-store' },
  );
  const response = new Response(svgResponse.body, svgResponse);
  // This is to prevent warnings on workerd runtime
  response.headers.set('Content-Type', 'text/xml');
  const svg = await svgResponse.text();

  return svg;
}

async function loadTextNodeFonts(nodeAttributes: ReturnType<typeof parseTextNode>[], loadFonts: LoadFontsFunction) {
  return (
    await Promise.all(
      nodeAttributes
        .filter(
          (value, index, self) =>
            index ===
            self.findIndex((t) => t?.fontFamily === value.fontFamily && t.fontWeight === value.fontWeight && t.fontStyle === value.fontStyle),
        )
        .map(async (attrs) => {
          const { family, weight, style } = {
            family: attrs.fontFamily,
            weight: attrs.fontWeight ? (Number(attrs.fontWeight) as FontWeight) : undefined,
            style: attrs.fontStyle || undefined,
          };
          const awaited = await loadFonts(family, weight, style);
          if (awaited) {
            return {
              name: family,
              weight,
              style,
              get data() {
                return typeof awaited === 'object' && 'data' in awaited ? awaited.data : awaited;
              },
            } as Font;
          }
          return undefined;
        }),
    )
  ).filter(Boolean) as Font[];
}

/**
 * Renders Figma template to image
 *
 * @param figmaOptions The {@link FigmaOptions}
 * @param renderOptions The {@link RenderFigmaOptions}
 *
 * @returns An object containing methods for rendering the Figma template to image
 */
export function renderFigma(figmaOptions: FigmaOptions, renderOptions?: RenderFigmaOptions) {
  const getFigmaData = async (): Promise<ElementResult> => {
    const { template } = figmaOptions;
    const svg = await getFigmaSvg(figmaOptions);
    const { width, height } = getSvgDimensions(svg);
    const textNodes = getTextNodes(svg);
    const textNodeAttributes = textNodes.map(parseTextNode);

    const dynamicFonts = typeof renderOptions?.loadFonts === 'function' ? await loadTextNodeFonts(textNodeAttributes, renderOptions.loadFonts) : [];

    const element: ReactElement = {
      key: '0',
      type: 'div',
      props: {
        style: { display: 'flex' },
        children: [
          {
            type: 'img',
            props: {
              style: { position: 'absolute' },
              alt: '',
              width,
              height,
              src: svgToBase64(removeTextNodes(svg)),
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                position: 'relative',
                width: '100%',
              },
              children: textNodeAttributes.map((textNode) => {
                const t = template[textNode.id];
                let value: { x: string; y: string; content: string }[] | string = '';
                if (t === undefined) {
                  value = textNode.children;
                } else if (isComplexTemplate(t)) {
                  value = (t as FigmaComplexTemplate).value;
                } else {
                  value = t as string;
                }
                let cssProps = {};
                let centerHorizontally = false;
                if (isComplexTemplate(t)) {
                  const complexTemplate = t as FigmaComplexTemplate;
                  if (complexTemplate.props) {
                    const { centerHorizontally: centerHorizontallyProp, ...otherCSSProps } = complexTemplate.props;
                    cssProps = otherCSSProps;
                    centerHorizontally = centerHorizontallyProp || false;
                  }
                }
                const children = Array.isArray(value)
                  ? value.map(
                      (e, i): ReactElement => ({
                        key: String(i),
                        type: 'span',
                        props: {
                          style: {
                            position: 'absolute',
                            left: `${Number(e.x) - Number(textNode.x)}px`,
                            top: `${Number(e.y) - Number(textNode.y) - Number(textNode.fontSize) / 2}px`,
                          },
                          children: e.content,
                        },
                      }),
                    )
                  : value;
                if (centerHorizontally) {
                  return {
                    type: 'div',
                    props: {
                      style: {
                        position: 'absolute',
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                      },
                      children: {
                        type: 'span',
                        props: {
                          style: {
                            color: textNode.fill,
                            marginTop: `${Number(textNode.y) - Number(textNode.fontSize) / 2}px`,
                            fontWeight: textNode.fontWeight || '400',
                            fontSize: textNode.fontSize,
                            fontFamily: textNode.fontFamily,
                            letterSpacing: textNode.letterSpacing,
                            textAlign: 'center',
                            ...cssProps,
                          },
                          children,
                        },
                      },
                    },
                  };
                }
                return {
                  type: 'span',
                  props: {
                    style: {
                      position: 'absolute',
                      color: textNode.fill,
                      left: `${textNode.x}px`,
                      top: `${Number(textNode.y) - Number(textNode.fontSize) / 2}px`,
                      fontWeight: textNode.fontWeight || '400',
                      fontSize: textNode.fontSize,
                      fontFamily: textNode.fontFamily,
                      letterSpacing: textNode.letterSpacing,
                      ...cssProps,
                    },
                    children,
                  },
                };
              }),
            },
          },
        ],
      },
    };

    return { element, width, height, fonts: dynamicFonts };
  };

  const data: {
    renderer: ReturnType<typeof render> | null;
    element: ElementResult | null;
    svg: SvgResult | null;
    png: PngResult | null;
  } = {
    renderer: null,
    element: null,
    svg: null,
    png: null,
  };

  const asElement = async () => {
    if (!data.element) {
      data.element = await getFigmaData();
    }

    return data.element;
  };

  const getRenderer = async () => {
    if (!data.renderer) {
      const elementData = await asElement();
      data.renderer = render(elementData.element, {
        ...renderOptions,
        width: elementData.width,
        height: elementData.height,
        fonts: [...elementData.fonts, ...(renderOptions?.fonts || [])],
      });
    }

    return data.renderer;
  };

  const asSvg = async () => {
    if (!data.svg) {
      data.svg = await (await getRenderer()).asSvg();
    }

    return data.svg;
  };

  const asPng = async () => {
    if (!data.png) {
      data.png = await (await getRenderer()).asPng();
    }

    return data.png;
  };

  return { asElement, asSvg, asPng };
}

/** A class for rendering Figma template to image as {@link Response} */
export class FigmaImageResponse extends BaseResponse {
  /**
   * Creates an instance of {@link FigmaImageResponse}
   *
   * @param figmaOptions Figma options {@link FigmaOptions}
   * @param responseOptions The same as {@link ImageResponseOptions} except `width` and `height`. `width` and `height` are automatically set from the Figma frame's size.
   */
  constructor(figmaOptions: FigmaOptions, responseOptions?: FigmaImageResponseOptions) {
    super(async () => {
      const renderer = renderFigma(figmaOptions, responseOptions);
      const elementData = await renderer.asElement();
      return [
        elementData.element,
        {
          ...responseOptions,
          width: elementData.width,
          height: elementData.height,
          fonts: [...elementData.fonts, ...(responseOptions?.fonts || [])],
        },
      ];
    }, responseOptions);
  }
}
