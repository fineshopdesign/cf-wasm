import type { ReactNode } from 'react';
import { CONTAINER } from './constants';
import { type RenderOptions, render } from './render';
import type { VNode } from './satori';
import type { MayBePromise, OnlyProps } from './types';

export interface RenderAsResponseOptions extends OnlyProps<ResponseInit, 'headers' | 'status' | 'statusText' | 'cf'> {
  format?: 'svg' | 'png';
}

export function renderAsResponse(input: () => MayBePromise<[ReactNode | VNode, RenderOptions | undefined]>, options?: RenderAsResponseOptions) {
  const isSvg = options?.format === 'svg';

  const headers = new Headers(options?.headers);
  if (!headers.has('Cache-Control')) {
    if (
      typeof process === 'object' &&
      process !== null &&
      typeof process.env === 'object' &&
      process.env !== null &&
      process.env.NODE_ENV === 'development'
    ) {
      headers.set('Cache-Control', 'no-cache, no-store');
    } else {
      headers.set('Cache-Control', 'public, immutable, no-transform, max-age=31536000');
    }
  }
  headers.set('Content-Type', isSvg ? 'image/svg+xml' : 'image/png');
  const init: ResponseInit = {
    headers,
    status: options?.status,
    statusText: options?.statusText,
  };
  // Add `cf` options if provided
  if (options && typeof options === 'object' && 'cf' in options) {
    Object.assign(init, { cf: options.cf });
  }

  const body = async (): Promise<string | Uint8Array<ArrayBuffer>> => {
    const [element, renderOptions] = await input();
    const renderer = render(element, renderOptions);
    const { image } = isSvg ? await renderer.asSvg() : await renderer.asPng();
    return image;
  };

  const stream = (): ReadableStream => {
    return new ReadableStream({
      start(controller) {
        body()
          .then((body) => {
            const bytes = typeof body === 'string' ? CONTAINER.encoder.encode(body) : body;
            controller.enqueue(bytes);
            controller.close();
          })
          .catch((e) => {
            controller.error(e);
          });
      },
    });
  };

  return {
    body,
    stream,
    init,
  };
}

/** An interface representing options for ImageResponse */
export interface ImageResponseOptions extends RenderOptions, RenderAsResponseOptions {}

/** A class for rendering {@link ReactNode} to image as {@link Response} */
export class ImageResponse extends Response {
  /**
   * Creates an instance of {@link ImageResponse}
   *
   * @param element The {@link ReactNode}
   * @param options The {@link ImageResponseOptions}
   */
  constructor(element: ReactNode | VNode, options?: ImageResponseOptions) {
    const { stream, init } = renderAsResponse(() => [element, options], options);

    super(stream(), init);
  }

  static async async(element: ReactNode | VNode, options?: ImageResponseOptions): Promise<Response> {
    const { body, init } = renderAsResponse(() => [element, options], options);

    return new Response(await body(), init);
  }
}
