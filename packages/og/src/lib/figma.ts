import { replaceEntities } from "./entities";
import { BaseResponse, type ImageResponseOptions } from "./response";
import { detectRuntime } from "./utils";
import { FetchError } from "./errors";
import type { Font, FontWeight } from "./satori";

export interface FigmaComplexTemplate {
	value: string;
	props?: {
		centerHorizontally?: boolean;
	} & React.CSSProperties;
}

export type FigmaImageResponseOptions = {
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

	/**
	 * Figma API token
	 */
	token: string;
};

export const parseFigmaUrl = (figmaUrl: string) => {
	const regex = /\/file\/([^/]+)\/[^?]+\?[^#]*node-id=([^&#]+)/;
	const match = figmaUrl.match(regex);
	let fileId = "";
	let nodeId = "";
	if (match) {
		fileId = match[1] || "";
		nodeId = match[2] || "";
	}
	return { fileId, nodeId };
};

export const assertValue = (
	value: string | undefined,
	errorMessage: string
) => {
	if (typeof value === "undefined") {
		throw new Error(errorMessage);
	}
	return value;
};

const match = (
	string: string,
	matcher: RegExp,
	index = 1,
	defaultValue = ""
) => {
	const matches = string.match(matcher);
	if (matches && matches[index]) {
		return matches[index];
	}
	return defaultValue;
};

export const isComplexTemplate = (template: unknown) =>
	typeof template !== "string" &&
	template !== undefined &&
	"value" in (template as { value?: unknown });

export const svgToBase64 = (svg: string) => {
	let base64: string;
	if (typeof Buffer !== "undefined") {
		base64 = Buffer.from(svg).toString("base64");
	} else if (typeof btoa === "function") {
		base64 = btoa(svg);
	} else {
		throw new Error("Base64 encoding is not supported in this environment.");
	}

	return `data:image/svg+xml;base64,${base64}`;
};

export const getSvgDimensions = (svg: string) => {
	const widthMatch = svg.match(/width="(\d+)/);
	const heightMatch = svg.match(/height="(\d+)/);
	if (widthMatch && heightMatch) {
		const width = Number(widthMatch[1]);
		const height = Number(heightMatch[1]);
		return { width, height };
	}
	return { width: 0, height: 0 };
};

export const getTextNodes = (svg: string) => {
	const regex = /<text[^>]*>(.*?)<\/text>/g;
	let execArray = regex.exec(svg);
	const matches = [];
	while (execArray !== null) {
		matches.push(execArray[0]);
		execArray = regex.exec(svg);
	}
	return matches;
};

export const getTspanNodes = (text: string) => {
	const regex = /<tspan[^>]*>(.*?)<\/tspan>/g;
	let execArray = regex.exec(text);
	const matches = [];
	while (execArray !== null) {
		matches.push(execArray[0]);
		execArray = regex.exec(text);
	}
	return matches;
};

export const parseTspanNode = (tspanNode: string) => ({
	x: match(tspanNode, /x="([^"]*)"/),
	y: match(tspanNode, /y="([^"]*)"/),
	content: replaceEntities(match(tspanNode, /<tspan[^>]*>([^<]*)<\/tspan>/))
});

export const parseTextNode = (textNode: string) => {
	const tspanNodesAttributes = getTspanNodes(textNode).map(parseTspanNode);

	return {
		id: match(textNode, /id="([^"]*)"/),
		fill: match(textNode, /fill="([^"]*)"/),
		fontFamily: match(textNode, /font-family="([^"]*)"/),
		fontSize: match(textNode, /font-size="([^"]*)"/),
		fontWeight:
			match(textNode, /font-weight="([^"]*)"/)
				.replace("normal", "400")
				.replace("bold", "700") || undefined,
		fontStyle: (match(textNode, /font-style="([^"]*)"/) || undefined) as
			| "normal"
			| "italic"
			| undefined,
		letterSpacing: match(textNode, /letter-spacing="([^"]*)"/),
		x: tspanNodesAttributes[0].x,
		y: tspanNodesAttributes[0].y,
		children: tspanNodesAttributes
	};
};

export const removeTextNodes = (svg: string) =>
	svg.replace(/<text[^>]*>(.*?)<\/text>/g, "");

export const getFigmaSvg = async (figmaOptions: FigmaImageResponseOptions) => {
	const { url, token } = figmaOptions;
	const { fileId, nodeId } = parseFigmaUrl(url);

	assertValue(url, "(@cf-wasm/og) [ERROR] 'url' field is required");
	assertValue(token, "(@cf-wasm/og) [ERROR] 'token' field is required");

	const apiUrl = `https://api.figma.com/v1/images/${fileId}?ids=${nodeId}&svg_outline_text=false&format=svg&svg_include_id=true`;
	const figmaResponse = await fetch(apiUrl, {
		method: "GET",
		headers: {
			"X-FIGMA-TOKEN": token
		},
		// This is to prevent errors on workerd runtime
		...(detectRuntime() === "workerd" ? undefined : { cache: "no-store" })
	})
		.then((res) => {
			if (!res.ok) {
				throw new FetchError(
					`Response was not successful (status: ${res.status}, statusText: ${res.statusText})`,
					{ response: res }
				);
			}
			return res;
		})
		.catch((e) => {
			throw new FetchError(
				`Failed to fetch figma image. An error ocurred while fetching ${apiUrl}`,
				{ cause: e, response: e instanceof FetchError ? e.response : undefined }
			);
		});

	const figmaResponseJson = (await figmaResponse.json()) as {
		images: Record<string, string>;
	};
	const svgDownloadPath = figmaResponseJson.images[nodeId.replace("-", ":")];
	const svgResponse = await fetch(
		svgDownloadPath,
		// This is to prevent errors on workerd runtime
		detectRuntime() === "workerd" ? undefined : { cache: "no-store" }
	);
	const response = new Response(svgResponse.body, svgResponse);
	// This is to prevent warnings on workerd runtime
	response.headers.set("Content-Type", "text/xml");
	const svg = await svgResponse.text();

	return svg;
};

export class FigmaImageResponse extends BaseResponse {
	/**
	 * Creates an instance of {@link FigmaImageResponse}
	 *
	 * @param figmaOptions Figma options {@link FigmaImageResponseOptions}
	 * @param responseOptions The same as {@link ImageResponseOptions} except `width` and `height`. `width` and `height` are automatically set from the Figma frame's size.
	 */
	constructor(
		figmaOptions: FigmaImageResponseOptions,
		responseOptions?: Omit<ImageResponseOptions, "width" | "height"> & {
			loadFonts?: (
				fontFamily: string,
				fontWeight: FontWeight | undefined,
				fontStyle: "normal" | "italic" | undefined
			) =>
				| { data: ArrayBuffer | Promise<ArrayBuffer> }
				| ArrayBuffer
				| Promise<
						{ data: ArrayBuffer | Promise<ArrayBuffer> } | ArrayBuffer | void
				  >
				| void;
		}
	) {
		super(
			async () => {
				const { template } = figmaOptions;
				const svg = await getFigmaSvg(figmaOptions);
				const { width, height } = getSvgDimensions(svg);
				const textNodes = getTextNodes(svg);
				const textNodeAttributes = textNodes.map(parseTextNode);

				const dynamicFonts =
					typeof responseOptions?.loadFonts === "function"
						? ((
								await Promise.all(
									textNodeAttributes
										.filter(
											(value, index, self) =>
												index ===
												self.findIndex(
													(t) =>
														t?.fontFamily === value.fontFamily &&
														t.fontWeight === value.fontWeight &&
														t.fontStyle === value.fontStyle
												)
										)
										.map(async (attrs) => {
											const { family, weight, style } = {
												family: attrs.fontFamily,
												weight: attrs.fontWeight
													? (Number(attrs.fontWeight) as FontWeight)
													: undefined,
												style: attrs.fontStyle || undefined
											};
											const awaited = await responseOptions.loadFonts!(
												family,
												weight,
												style
											);
											if (awaited) {
												return {
													name: family,
													weight,
													style,
													get data() {
														return typeof awaited === "object" &&
															"data" in awaited
															? awaited.data
															: awaited;
													}
												} as Omit<Font, "data"> & {
													data: ArrayBuffer | Promise<ArrayBuffer>;
												};
											}
											return undefined;
										})
								)
							).filter(Boolean) as (Omit<Font, "data"> & {
								data: ArrayBuffer | Promise<ArrayBuffer>;
							})[])
						: [];

				return [
					{
						key: "0",
						type: "div",
						props: {
							style: { display: "flex" },
							children: [
								{
									type: "img",
									props: {
										style: { position: "absolute" },
										alt: "",
										width,
										height,
										src: svgToBase64(removeTextNodes(svg))
									}
								},
								{
									type: "div",
									props: {
										style: {
											display: "flex",
											position: "relative",
											width: "100%"
										},
										children: textNodeAttributes.map((textNode) => {
											const t = template[textNode.id];
											let value:
												| { x: string; y: string; content: string }[]
												| string = "";
											if (t === undefined) {
												value = textNode.children;
											} else if (isComplexTemplate(t)) {
												// eslint-disable-next-line prefer-destructuring
												value = (t as FigmaComplexTemplate).value;
											} else {
												value = t as string;
											}
											let cssProps = {};
											let centerHorizontally = false;
											if (
												isComplexTemplate(t) &&
												(t as FigmaComplexTemplate).props
											) {
												const {
													centerHorizontally: centerHorizontallyProp,
													...otherCSSProps
												} = (t as FigmaComplexTemplate).props!;
												cssProps = otherCSSProps;
												centerHorizontally = centerHorizontallyProp || false;
											}
											const children = Array.isArray(value)
												? value.map(
														(e, i): React.ReactElement => ({
															key: String(i),
															type: "span",
															props: {
																style: {
																	position: "absolute",
																	left: `${Number(e.x) - Number(textNode.x)}px`,
																	top: `${Number(e.y) - Number(textNode.y) - Number(textNode.fontSize) / 2}px`
																},
																children: e.content
															}
														})
													)
												: value;
											if (centerHorizontally) {
												return {
													type: "div",
													props: {
														style: {
															position: "absolute",
															display: "flex",
															justifyContent: "center",
															width: "100%"
														},
														children: {
															type: "span",
															props: {
																style: {
																	color: textNode.fill,
																	marginTop: `${Number(textNode.y) - Number(textNode.fontSize) / 2}px`,
																	fontWeight: textNode.fontWeight || "400",
																	fontSize: textNode.fontSize,
																	fontFamily: textNode.fontFamily,
																	letterSpacing: textNode.letterSpacing,
																	textAlign: "center",
																	...cssProps
																},
																children
															}
														}
													}
												};
											}
											return {
												type: "span",
												props: {
													style: {
														position: "absolute",
														color: textNode.fill,
														left: `${textNode.x}px`,
														top: `${Number(textNode.y) - Number(textNode.fontSize) / 2}px`,
														fontWeight: textNode.fontWeight || "400",
														fontSize: textNode.fontSize,
														fontFamily: textNode.fontFamily,
														letterSpacing: textNode.letterSpacing,
														...cssProps
													},
													children
												}
											};
										})
									}
								}
							]
						}
					},
					{
						width,
						height,
						...responseOptions,
						fonts: [...dynamicFonts, ...(responseOptions?.fonts || [])]
					}
				];
			},
			{
				...responseOptions
			}
		);
	}
}
