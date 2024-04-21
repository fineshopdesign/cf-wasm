export interface FetchErrorOptions extends ErrorOptions {
	response?: Response;
}

export class FetchError extends Error {
	name = "FetchError";

	response: Response | undefined;

	constructor(message: string, options?: FetchErrorOptions) {
		super(message, options);
		this.response = options?.response;
	}
}
