import { render, type RenderOptions } from "./render";

export type ImageResponseOptions = RenderOptions & {
	format?: "svg" | "png";
} & ConstructorParameters<typeof Response>[1];

export const encoder = new TextEncoder();

/**
 * A class for rendering {@link React.ReactElement} to image as {@link Response}
 */
export default class ImageResponse extends Response {
	/**
	 * Creates an instance of {@link ImageResponse}
	 *
	 * @param element The {@link React.ReactElement}
	 * @param options The {@link ImageResponseOptions}
	 */
	constructor(element: React.ReactElement, options?: ImageResponseOptions) {
		const isSvg = options?.format === "svg";
		const result = new ReadableStream({
			start(controller) {
				const renderer = render(element, options);
				(isSvg ? renderer.asSvg() : renderer.asPng())
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
