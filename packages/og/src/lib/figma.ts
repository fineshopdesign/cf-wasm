import ImageResponse, { type ImageResponseOptions } from "./response";

export const isComplexTemplate = (template: unknown) =>
	typeof template !== "string" &&
	template !== undefined &&
	"value" in (template as { value?: unknown });

export const svgToBase64 = (svg: string) => {
	let base64: string;
	if (typeof Buffer !== "undefined") {
		base64 = Buffer.from(svg).toString("base64");
	} else if (typeof btoa === "function") {
		console.warn(
			"(@cf-wasm/og) [ WARNING ] Using btoa global function for svg string base64 encoding."
		);
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
		const width = Number.parseInt(widthMatch[1], 10);
		const height = Number.parseInt(heightMatch[1], 10);
		return { width, height };
	}
	return { width: 0, height: 0 };
};

export const getTextNodes = (svg: string) => {
	const regex = /<text[^>]*>(.*?)<\/text>/g;
	let match = regex.exec(svg);
	const matches = [];
	while (match !== null) {
		matches.push(match[0]);
		match = regex.exec(svg);
	}
	return matches;
};

export const parseSvgText = (svgText: string) => {
	const get = (
		matches: RegExpMatchArray | null,
		index: number = 1,
		defaultValue: string = ""
	) => {
		if (matches && matches[index]) {
			return matches[index];
		}
		return defaultValue;
	};

	return {
		id: get(svgText.match(/id="([^"]*)"/)),
		fill: get(svgText.match(/fill="([^"]*)"/)),
		fontFamily: get(svgText.match(/font-family="([^"]*)"/)),
		fontSize: get(svgText.match(/font-size="([^"]*)"/)),
		fontWeight: get(svgText.match(/font-weight="([^"]*)"/)),
		letterSpacing: get(svgText.match(/letter-spacing="([^"]*)"/)),
		x: get(svgText.match(/<tspan[^>]*x="([^"]*)"/)),
		y: get(svgText.match(/<tspan[^>]*y="([^"]*)"/)),
		content: get(svgText.match(/<tspan[^>]*>([^<]*)<\/tspan>/))
	};
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
/**
 * @param figmaOptions Figma options {@link FigmaImageResponseOptions}
 * @param responseOptions The same as {@link ImageResponseOptions} except `width` and `height`. `width` and `height` are automatically set from the Figma frame's size.
 *
 * @returns The {@link ImageResponse} instance
 */
export const FigmaImageResponse = async (
	figmaOptions: FigmaImageResponseOptions,
	responseOptions?: Omit<ImageResponseOptions, "width" | "height">
) => {
	const { url, template, token } = figmaOptions;
	const { fileId, nodeId } = parseFigmaUrl(url);

	assertValue(url, "(@cf-wasm/og) [ERROR] 'url' field is required");
	assertValue(token, "(@cf-wasm/og) [ERROR] 'token' field is required");

	const figmaResponse = await fetch(
		`https://api.figma.com/v1/images/${fileId}?ids=${nodeId}&svg_outline_text=false&format=svg&svg_include_id=true`,
		{
			method: "GET",
			headers: {
				"X-FIGMA-TOKEN": token
			},
			cache: "no-store"
		}
	);

	const figmaResponseJson = (await figmaResponse.json()) as {
		images: Record<string, string>;
	};
	const svgDownloadPath = figmaResponseJson.images[nodeId.replace("-", ":")];
	const svgResponse = await fetch(svgDownloadPath, { cache: "no-store" });
	const svg = await svgResponse.text();
	const { width, height } = getSvgDimensions(svg);
	const textNodes = getTextNodes(svg);
	const textNodeAttributes = textNodes.map(parseSvgText);

	return new ImageResponse(
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
							src: svgToBase64(svg)
						}
					},
					{
						type: "div",
						props: {
							style: { display: "flex", position: "relative", width: "100%" },
							children: textNodeAttributes.map((textNode) => {
								const t = template[textNode.id];
								let value = "";
								if (t === undefined) {
									value = textNode.content;
								} else if (isComplexTemplate(t)) {
									// eslint-disable-next-line prefer-destructuring
									value = (t as FigmaComplexTemplate).value;
								} else {
									value = t as string;
								}
								let cssProps = {};
								let centerHorizontally = false;
								if (isComplexTemplate(t) && (t as FigmaComplexTemplate).props) {
									const {
										centerHorizontally: centerHorizontallyProp,
										...otherCSSProps
									} = (t as FigmaComplexTemplate).props!;
									cssProps = otherCSSProps;
									centerHorizontally = centerHorizontallyProp || false;
								}
								if (centerHorizontally) {
									const templateStyles = {
										color: textNode.fill,
										marginTop: `${Number.parseInt(textNode.y, 10) - Number.parseInt(textNode.fontSize, 10)}px`,
										fontWeight: textNode.fontWeight || "400",
										fontSize: textNode.fontSize,
										fontFamily: textNode.fontFamily,
										letterSpacing: textNode.letterSpacing,
										textAlign: "center",
										...cssProps
									};
									return {
										type: "div",
										props: {
											style: {
												display: "flex",
												justifyContent: "center",
												position: "absolute",
												width: "100%"
											},
											children: {
												type: "div",
												props: {
													style: templateStyles,
													children: value
												}
											}
										}
									};
								}
								return {
									type: "div",
									props: {
										style: {
											position: "absolute",
											color: textNode.fill,
											left: `${textNode.x}px`,
											top: `${Number.parseInt(textNode.y, 10) - Number.parseInt(textNode.fontSize, 10)}px`,
											fontWeight: textNode.fontWeight || "400",
											fontSize: textNode.fontSize,
											fontFamily: textNode.fontFamily,
											letterSpacing: textNode.letterSpacing,
											...cssProps
										},
										children: value
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
			...responseOptions
		}
	);
};
