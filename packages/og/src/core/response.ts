import type { ReactElement } from 'react';
import { CONTAINER } from './constants';
import { type PngResult, type RenderOptions, type SvgResult, render } from './render';
import type { MayBePromise, OnlyProps } from './types';

/** Base response options */
export interface BaseResponseOptions extends OnlyProps<ResponseInit, 'headers' | 'status' | 'statusText' | 'cf'> {
  format?: 'svg' | 'png';
}

/** An interface representing options for BaseResponse */
export interface ImageResponseOptions extends RenderOptions, BaseResponseOptions {}

/** Base response class */
export class BaseResponse extends Response {
  constructor(input: () => MayBePromise<[ReactElement, RenderOptions | undefined]>, options: BaseResponseOptions = {}) {
    const isSvg = options?.format === 'svg';
    const result = new ReadableStream({
      start(controller) {
        Promise.resolve(input())
          .then(([element, renderOptions]): Promise<SvgResult | PngResult> => {
            const renderer = render(element, renderOptions);
            return isSvg ? renderer.asSvg() : renderer.asPng();
          })
          .then(({ image }) => {
            const bytes = typeof image === 'string' ? CONTAINER.encoder.encode(image) : image;
            controller.enqueue(bytes);
            controller.close();
          })
          .catch((e) => {
            controller.error(e);
          });
      },
    });
    const headers = new Headers(options?.headers);
    headers.set('Content-Type', isSvg ? 'image/svg+xml' : 'image/png');
    const requestInit = {
      headers,
      status: options?.status,
      statusText: options?.statusText,
    };
    if (options && typeof options === 'object') {
      // Add `cf` options if provided
      if ('cf' in options) {
        Object.assign(requestInit, { cf: options.cf });
      }
    }
    super(result, requestInit);
  }
}

/** A class for rendering {@link ReactElement} to image as {@link Response} */
export class ImageResponse extends BaseResponse {
  /**
   * Creates an instance of {@link ImageResponse}
   *
   * @param element The {@link ReactElement}
   * @param options The {@link ImageResponseOptions}
   */
  constructor(element: ReactElement, options?: ImageResponseOptions) {
    super(() => [element, options], options);
  }
}
