/* eslint-disable max-classes-per-file */
import {
	render,
	type RenderOptions,
	type SvgResult,
	type PngResult
} from "./render";

export type BaseResponseOptions = Omit<
	ResponseInit,
	"webSocket" | "encodeBody"
> & {
	format?: "svg" | "png";
};

export type ImageResponseOptions = RenderOptions & BaseResponseOptions;

type MayBePromise<T> = T | Promise<T>;

export const encoder = new TextEncoder();

export class BaseResponse extends Response {
	constructor(
		input: () => MayBePromise<
			[string | React.ReactElement, RenderOptions | undefined]
		>,
		options?: BaseResponseOptions
	) {
		const isSvg = options?.format === "svg";
		const result = new ReadableStream({
			start(controller) {
				Promise.resolve(input())
					.then(([element, renderOptions]): Promise<SvgResult | PngResult> => {
						const renderer = render(element, renderOptions);
						return isSvg ? renderer.asSvg() : renderer.asPng();
					})
					.then(({ image }) => {
						const bytes =
							typeof image === "string" ? encoder.encode(image) : image;
						controller.enqueue(bytes);
						controller.close();
					})
					.catch((e) => {
						controller.error(e);
					});
			}
		});
		const headers = new Headers(options?.headers);
		headers.set("Content-Type", isSvg ? "image/svg+xml" : "image/png");
		super(result, {
			headers,
			status: options?.status,
			statusText: options?.statusText
		});
	}
}

/**
 * A class for rendering {@link React.ReactElement} to image as {@link Response}
 */
export default class ImageResponse extends BaseResponse {
	/**
	 * Creates an instance of {@link ImageResponse}
	 *
	 * @param element The {@link React.ReactElement} or html string
	 * @param options The {@link ImageResponseOptions}
	 */
	constructor(
		element: string | React.ReactElement,
		options?: ImageResponseOptions
	) {
		super(() => [element, options], options);
	}
}
