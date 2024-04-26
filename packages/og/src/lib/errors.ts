/**
 * An interface representing the options for constructing {@link FetchError}
 */
export interface FetchErrorOptions extends ErrorOptions {
	/**
	 * The `Response` object if applicable
	 */
	response?: Response;
}

/**
 * Represents a Error ocurred while fetching
 */
export class FetchError extends Error {
	name = "FetchError";

	/**
	 * The response object for which fetch failed if provided
	 */
	response: Response | undefined;

	/**
	 * Creates an instance of {@link FetchError}
	 *
	 * @param message The error message
	 * @param options The {@link FetchErrorOptions}
	 */
	constructor(message: string, options?: FetchErrorOptions) {
		super(message, options);
		this.response = options?.response;
	}
}
